import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const pathname = request.nextUrl.pathname;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        // Not logged in -> redirect to home
        if (!token) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Not admin -> redirect to home
        if (token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"]
};
