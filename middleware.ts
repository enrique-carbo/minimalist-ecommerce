import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isBuyer = token?.role === "BUYER"

    const { pathname } = req.nextUrl

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Buyer routes protection
    if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/api/admin/:path*",
  ],
}