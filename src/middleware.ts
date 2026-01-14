import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    // Protect admin routes
    if (nextUrl.pathname.startsWith("/admin")) {
        // Not logged in -> redirect to home with debug
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/?error=no_token_auth_wrapper", nextUrl));
        }

        // Not admin -> redirect to home with debug
        // Ensure case-insensitive check
        const userRole = (req.auth?.user as any)?.role;
        const role = String(userRole || "").toUpperCase();

        if (role !== "ADMIN") {
            return NextResponse.redirect(new URL(`/?error=role_mismatch_${role}`, nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*"]
};
