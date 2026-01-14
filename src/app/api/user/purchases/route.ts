import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const purchases = await prisma.purchase.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                courseId: true,
            },
        });

        const purchasedCourseIds = purchases.map((p) => p.courseId);

        return NextResponse.json(purchasedCourseIds);
    } catch (error) {
        console.error("[USER_PURCHASES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { courseId } = await req.json();
        if (!courseId) {
            return new NextResponse("Missing courseId", { status: 400 });
        }

        await prisma.purchase.deleteMany({
            where: {
                userId: session.user.id,
                courseId: courseId,
            },
        });

        return new NextResponse("Purchase removed", { status: 200 });
    } catch (error) {
        console.error("[USER_PURCHASES_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
