import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if there's an authentication cookie for protected routes
  const { pathname } = request.nextUrl

  // Routes that require authentication
  const protectedRoutes = ['/dashboard', '/teacher', '/play']

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const hasSession = request.cookies.has('auth-token')

    // For now, allow access - Supabase auth will handle on client side
    // In production, you'd verify the session here
    if (!hasSession && pathname !== '/join') {
      // Optionally redirect to auth page
      // return NextResponse.redirect(new URL('/api/auth', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
