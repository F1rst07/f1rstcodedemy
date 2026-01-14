
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const whereClause = status ? { status } : {};

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true, image: true } },
                items: {
                    include: {
                        course: { select: { title: true, price: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("[ADMIN_ORDERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return new NextResponse("Missing data", { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) return new NextResponse("Order not found", { status: 404 });

        // Update Order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        // If Approved/Completed, Unlock Courses
        if (status === "COMPLETED") {
            // Transaction? Or just loop. Loop is fine for now but Promise.all
            // Find existing purchases to avoid duplicates

            const itemCourseIds = order.items.map(item => item.courseId);

            // Just try to create many ignoring duplicates? Prisma createMany skipDuplicates is handy if supported by DB but Turso supports it usually.
            // But let's be safe and check.

            const existingPurchases = await prisma.purchase.findMany({
                where: {
                    userId: order.userId,
                    courseId: { in: itemCourseIds }
                }
            });
            const existingCourseIds = existingPurchases.map(p => p.courseId);

            const coursesToUnlock = itemCourseIds.filter(id => !existingCourseIds.includes(id));

            if (coursesToUnlock.length > 0) {
                await prisma.purchase.createMany({
                    data: coursesToUnlock.map(id => ({
                        userId: order.userId,
                        courseId: id
                    }))
                });
            }
        }

        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error("[ADMIN_ORDERS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
