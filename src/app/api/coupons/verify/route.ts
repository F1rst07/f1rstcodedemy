
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return new NextResponse("Coupon code required", { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ isValid: false, message: "Invalid coupon code" }, { status: 400 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ isValid: false, message: "This coupon is inactive" }, { status: 400 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ isValid: false, message: "This coupon has expired" }, { status: 400 });
        }

        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
            return NextResponse.json({ isValid: false, message: "This coupon has reached its usage limit" }, { status: 400 });
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.discountPercent) {
            discountAmount = (cartTotal * coupon.discountPercent) / 100;
        } else if (coupon.discountAmount) {
            discountAmount = coupon.discountAmount;
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal);

        return NextResponse.json({
            isValid: true,
            coupon,
            discountAmount,
            newTotal: cartTotal - discountAmount
        });

    } catch (error) {
        console.error("[COUPON_VERIFY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
