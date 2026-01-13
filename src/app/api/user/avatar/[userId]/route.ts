
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId) {
            return new NextResponse("User ID required", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { image: true }
        });

        if (!user || !user.image) {
            // Return a default placeholder or 404
            return new NextResponse("Not Found", { status: 404 });
        }

        // Check if image is Base64
        const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            // Assume it's a URL (e.g. from Google Auth) -> Redirect
            return NextResponse.redirect(new URL(user.image, req.url));
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": type,
                "Cache-Control": "public, max-age=31536000, immutable" // Cache heavily
            }
        });

    } catch (error) {
        console.error("[AVATAR_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
