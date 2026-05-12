// Auth is temporarily disabled for /admin and /api/admin routes.
// Re-enable by restoring the next-auth middleware below.
//
// import { withAuth } from "next-auth/middleware";
//
// export default withAuth({
//   pages: {
//     signIn: "/admin/login",
//   },
//   callbacks: {
//     authorized: ({ token }) => token?.role === "ADMIN",
//   },
// });
//
// export const config = {
//   matcher: ["/admin/((?!login).*)", "/api/admin/:path*"],
// };

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  // Match nothing — admin auth is currently disabled.
  matcher: [],
};
