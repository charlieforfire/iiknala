import { NextRequest, NextResponse } from 'next/server'

const MAINTENANCE = true

export function middleware(req: NextRequest) {
  if (!MAINTENANCE) return NextResponse.next()

  const { pathname } = req.nextUrl

  // Dejar pasar admin, api y la propia página de mantenimiento
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/mantenimiento') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/mantenimiento', req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|mp4|ico|woff2?)).*)'],
}
