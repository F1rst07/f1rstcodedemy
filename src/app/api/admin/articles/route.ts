
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const articles = await prisma.article.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error("[ADMIN_ARTICLES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, content, imageUrl, isPublished } = await req.json();

        if (!title || !content) {
            return new NextResponse("Title and content are required", { status: 400 });
        }

        const article = await prisma.article.create({
            data: {
                title,
                content,
                imageUrl,
                isPublished: isPublished || false,
            },
        });

        return NextResponse.json(article);
    } catch (error: any) {
        console.error("[ADMIN_ARTICLES_POST]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
