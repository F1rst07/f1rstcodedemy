
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return new NextResponse(null, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { image: true }
        });

        if (!user || !user.image) {
            return new NextResponse(null, { status: 404 });
        }

        // If it's an external URL (e.g. Google), redirect to it
        if (user.image.startsWith("http")) {
            return NextResponse.redirect(user.image);
        }

        // If it's base64, serve it as an image
        if (user.image.startsWith("data:")) {
            const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                return new NextResponse(null, { status: 400 });
            }

            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], "base64");

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=3600, must-revalidate"
                }
            });
        }

        return new NextResponse(null, { status: 400 });
    } catch (error) {
        console.error("Avatar API Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
