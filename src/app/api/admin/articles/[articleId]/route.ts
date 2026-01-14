
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { articleId } = await params;

        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });

        if (!article) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(article);
    } catch (error: any) {
        console.error("[ADMIN_ARTICLE_GET]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { articleId } = await params;
        const { title, content, imageUrl, isPublished } = await req.json();

        const article = await prisma.article.update({
            where: { id: articleId },
            data: {
                title,
                content,
                imageUrl,
                isPublished,
            },
        });

        return NextResponse.json(article);
    } catch (error: any) {
        console.error("[ADMIN_ARTICLE_PATCH]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { articleId } = await params;

        const article = await prisma.article.delete({
            where: { id: articleId },
        });

        return NextResponse.json(article);
    } catch (error: any) {
        console.error("[ADMIN_ARTICLE_DELETE]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
