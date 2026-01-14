import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    const pathname = request.nextUrl.pathname;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        // Not logged in -> redirect to home with debug
        if (!token) {
            return NextResponse.redirect(new URL("/?error=no_token", request.url));
        }

        // Not admin -> redirect to home with debug
        // Ensure case-insensitive check
        const role = String(token.role || "").toUpperCase();
        if (role !== "ADMIN") {
            return NextResponse.redirect(new URL(`/?error=role_mismatch_${role}`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"]
};
