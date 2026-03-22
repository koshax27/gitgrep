import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // لو مش مسجل دخول
  if (!token) {
    if (request.nextUrl.pathname === "/dashboard" || request.nextUrl.pathname === "/error-dashboard") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  // لو مسجل بس مش admin
  if (token && token.email !== "koshax27@gmail.com") {
    if (request.nextUrl.pathname === "/dashboard" || request.nextUrl.pathname === "/error-dashboard") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/error-dashboard"],
}