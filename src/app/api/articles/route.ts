
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const articles = await prisma.article.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                content: true, // Needed for snippet, though we might want to trim it here to save bandwidth
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                isPublished: true
            }
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error("[PUBLIC_ARTICLES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
