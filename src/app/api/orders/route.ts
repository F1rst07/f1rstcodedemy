import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const courseIds = body.courseIds as string[];
        const couponCode = body.couponCode as string | undefined;

        // Legacy single courseId support
        if (body.courseId && (!courseIds || courseIds.length === 0)) {
            courseIds.push(body.courseId);
        }

        if (!courseIds || courseIds.length === 0) {
            return new NextResponse("Course IDs Required", { status: 400 });
        }

        const userId = session.user.id;

        // 1. Fetch all courses
        const courses = await prisma.course.findMany({
            where: {
                id: { in: courseIds }
                // isPublished: true // Allow buying draft courses for testing
            }
        });

        if (courses.length !== courseIds.length) {
            return new NextResponse("One or more courses not found or unavailable", { status: 400 });
        }

        // 2. Filter out already purchased courses
        const purchased = await prisma.purchase.findMany({
            where: {
                userId: userId,
                courseId: { in: courseIds }
            }
        });

        const purchasedIds = purchased.map(p => p.courseId);
        const coursesToBuy = courses.filter(c => !purchasedIds.includes(c.id));

        if (coursesToBuy.length === 0) {
            return new NextResponse("All selected courses already purchased", { status: 400 });
        }

        // 3. Calculate Base Total
        let total = coursesToBuy.reduce((acc, c) => acc + (c.price || 0), 0);
        let couponId: string | undefined = undefined;

        // 3.5 Apply Coupon (If provided)
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });

            if (coupon && coupon.isActive) {
                // Check Expiry
                if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
                    // Check Limits
                    if (!coupon.maxUses || coupon.currentUses < coupon.maxUses) {
                        let discount = 0;
                        if (coupon.discountPercent) {
                            discount = (total * coupon.discountPercent) / 100;
                        } else if (coupon.discountAmount) {
                            discount = coupon.discountAmount;
                        }

                        // Apply discount but ensure total is not negative
                        total = Math.max(0, total - discount);
                        couponId = coupon.id;
                    }
                }
            }
        }

        // 4. Create Order & Items
        if (total === 0) {
            const result = await prisma.$transaction(async (tx) => {
                // Create Order
                const order = await tx.order.create({
                    data: {
                        userId: userId,
                        total: 0,
                        status: "COMPLETED",
                        courseId: coursesToBuy[0].id, // Legacy support constraint fix
                        couponId: couponId,
                        items: {
                            create: coursesToBuy.map(c => ({
                                courseId: c.id,
                                price: 0 // Free because total is 0
                            }))
                        }
                    }
                });

                // Create Purchases
                await tx.purchase.createMany({
                    data: coursesToBuy.map(c => ({
                        userId: userId,
                        courseId: c.id
                    }))
                });

                // Increment Coupon Usage
                if (couponId) {
                    await tx.coupon.update({
                        where: { id: couponId },
                        data: { currentUses: { increment: 1 } }
                    });
                }

                return order;
            });
            return NextResponse.json(result);
        }

        // Paid Order
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    total: total,
                    status: "PENDING",
                    courseId: coursesToBuy[0].id, // Legacy support constraint fix
                    couponId: couponId,
                    items: {
                        create: coursesToBuy.map(c => ({
                            courseId: c.id,
                            price: c.price || 0
                        }))
                    }
                }
            });

            // Increment Coupon Usage (Optimistic increment - usually done after payment checks in real production, 
            // but for simple flow we reserve it here. If payment fails, it might need rollback logic or just accept the slight discrepancy)
            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { currentUses: { increment: 1 } }
                });
            }

            return order;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[ORDERS_POST]", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId: session.user.id },
            include: {
                // course: true, // removed because order is now 1-to-many items
                items: {
                    include: {
                        course: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(orders);

    } catch (error) {
        console.error("[ORDERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
