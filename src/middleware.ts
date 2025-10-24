import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/register", "/login/:path*", "/"],
};

export async function middleware(request: NextRequest) {
    console.log("Middleware triggered for pathname:", request.nextUrl.pathname); // دیباگ

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;
    const publicPaths = ["/register", "/login"]; // مسیرهای عمومی
    const privatePaths = ["/dashboard", "/profile", "/"];

    // ریدایرکت سفارشی برای /login/09391470427 به /login
    if (pathname === "/login/09391470427") {
        console.log("Redirecting /login/09391470427 to /login"); // دیباگ
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // مسیرهای عمومی → اگر کاربر لاگین کرده، ریدایرکت بر اساس نوع
    if (publicPaths.includes(pathname)) {
        if (token) {
            if (token.supplier) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } else if (token.user?.admin) {
                return NextResponse.redirect(new URL("/dashboard/modern", request.url));
            }
        }
        return NextResponse.next();
    }

    // مسیرهای خصوصی → اگر کاربر لاگین نکرده، ریدایرکت به /register
    if (privatePaths.some(path => pathname === path || pathname.startsWith(path))) {
        if (!token) {
            return NextResponse.redirect(new URL("/register", request.url));
        } else {
            if (token.supplier) {
                if (!pathname.startsWith("/dashboard")) {
                    return NextResponse.redirect(new URL("/dashboard", request.url));
                }
            } else if (token.user?.admin) {
                if (!pathname.startsWith("/dashboard/modern")) {
                    return NextResponse.redirect(new URL("/dashboard/modern", request.url));
                }
            }
        }
    }

    return NextResponse.next();
}