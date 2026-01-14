import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await auth();
        const { orderId } = await params;
        const values = await req.json();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                userId: session.user.id
            }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // Update order with slipUrl and potentially other payment details
        // We might want to change status to "PENDING_REVIEW" or just keep "PENDING"
        // For now, let's keep PENDING but save the slip
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                ...values,
                // status: "PENDING_REVIEW" // Optional: if we want to distinguish status
            }
        });

        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error("[ORDER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
