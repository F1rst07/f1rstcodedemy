
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;

    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { role } = body;

        if (!role) return new NextResponse("Role required", { status: 400 });

        const updatedUser = await prisma.user.update({
            where: { id: params.userId },
            data: { role }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("[ADMIN_USER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;

    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Prevent deleting self
        if (session.user?.id === params.userId) {
            return new NextResponse("Cannot delete yourself", { status: 400 });
        }

        const deletedUser = await prisma.user.delete({
            where: { id: params.userId }
        });

        return NextResponse.json(deletedUser);

    } catch (error) {
        console.error("[ADMIN_USER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
