import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/register", "/login", "/"],
};

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    const { pathname } = request.nextUrl;
    const publicPaths = ["/register"];

    // مسیرهای عمومی → اگر تامین‌کننده لاگین کرده، ری‌دایرکت به داشبورد
    if (publicPaths.includes(pathname)) {
        if (token?.supplier) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // مسیرهای خصوصی → اگر تامین‌کننده لاگین نکرده، ری‌دایرکت به لاگین
    const privatePaths = ["/dashboard", "/profile", "/"];
    if (privatePaths.some(path => pathname === path || pathname.startsWith(path))) {
        if (!token?.supplier) {
            return NextResponse.redirect(new URL("/register", request.url));
        }
    }

    return NextResponse.next();
}
