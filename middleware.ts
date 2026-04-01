import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // redirect root to login only if not logged in
  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // block /admin if not admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // block /account if not logged in
  if (pathname.startsWith("/account") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/account/:path*"],
};