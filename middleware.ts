import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: Request) {
    const session = await auth();

    // The user is not logged in.
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const currentUrl = new URL(request.url);

    // If the user's account is pending approval
    if (session.user.status === "PENDING") {
        // Only allow them to access the /pending page
        if (currentUrl.pathname !== "/pending") {
            return NextResponse.redirect(new URL("/pending", request.url));
        }
    } else {
        // If the user's account is NOT pending, they shouldn't be on the pending page
        if (currentUrl.pathname === "/pending") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    // Match all routes except the public ones
    matcher: [
        "/dashboard/:path*",
        "/forum/:path*",
        "/polls/:path*",
        "/admin/:path*",
        "/pending"
    ],
};
