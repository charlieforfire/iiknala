import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const MAINTENANCE = true

export async function proxy(request: NextRequest) {
  if (MAINTENANCE) {
    const { pathname } = request.nextUrl

    const bypass =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/mantenimiento') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.')

    if (!bypass) {
      return NextResponse.redirect(new URL('/mantenimiento', request.url))
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
