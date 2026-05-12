// Auth gate for the client portal and admin area.
//
// Admin routes (/admin/**) require role === "ADMIN"; unauthenticated or
// non-admin users are redirected to /login (the shared login page).
//
// Portal routes (/portal/**, /api/portal/**) require any authenticated user
// and redirect to /login on failure.
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Admin: must be authenticated AND have ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Portal: any authenticated user
  if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // /admin exactly (the overview page) and all sub-routes except /admin/login
    "/admin",
    "/admin/((?!login).*)",
    // Client portal pages and APIs
    "/portal/:path*",
    "/api/portal/:path*",
  ],
};
