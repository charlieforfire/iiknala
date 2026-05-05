import { NextRequest, NextResponse } from 'next/server'

const MAINTENANCE = true

export function middleware(req: NextRequest) {
  if (!MAINTENANCE) return NextResponse.next()

  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/mantenimiento') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/mantenimiento', req.url))
}

export const config = {
  matcher: ['/:path*'],
}
