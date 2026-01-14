
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

        const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json(coupons);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { code, percent, amount, maxUses, expiresAt } = body;

        if (!code || (!percent && !amount)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountPercent: percent ? parseFloat(percent) : undefined,
                discountAmount: amount ? parseFloat(amount) : undefined,
                maxUses: maxUses ? parseInt(maxUses) : undefined,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                isActive: true
            }
        });
        return NextResponse.json(coupon);
    } catch (error) {
        console.error("[COUPON_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { id, isActive, code, percent, amount, maxUses, expiresAt } = body;

        // If only isActive is provided, it's a status toggle
        if (isActive !== undefined && code === undefined) {
            const coupon = await prisma.coupon.update({
                where: { id },
                data: { isActive }
            });
            return NextResponse.json(coupon);
        }

        // Full Update
        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                code: code ? code.toUpperCase() : undefined,
                discountPercent: percent ? parseFloat(percent) : null, // Set to null if switching types
                discountAmount: amount ? parseFloat(amount) : null,
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null, // Can clear date
                isActive: isActive // Optional update
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error("[COUPON_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (id) await prisma.coupon.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
