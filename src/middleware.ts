import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySession } from '@/lib/auth'

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/categories/:path*',
    '/api/hero-slides/:path*',
    '/api/settings/:path*',
    '/api/checkout/:path*',
    '/api/webhooks/:path*',
  ],
}

const PUBLIC_PATHS = new Set(['/admin/login'])
const PUBLIC_API_PATHS = new Set(['/api/admin/login', '/api/admin/logout'])
const PUBLIC_GET_PREFIXES = [
  '/api/products',
  '/api/categories',
  '/api/hero-slides',
  '/api/settings',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.has(pathname) || PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const isApi = pathname.startsWith('/api/')

  if (pathname.startsWith('/api/webhooks/stripe') && req.method === 'POST') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/checkout/') && req.method === 'POST') {
    return NextResponse.next()
  }

  if (isApi && (req.method === 'GET' || req.method === 'HEAD')) {
    if (PUBLIC_GET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next()
    }
  }

  if (
    isApi &&
    req.method === 'POST' &&
    /^\/api\/products\/[^/]+\/reviews\/?$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    return isApi
      ? NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
      : NextResponse.redirect(new URL('/admin/login?error=config', req.url))
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value
  const ok = await verifySession(token, secret)
  if (ok) return NextResponse.next()

  if (isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const loginUrl = new URL('/admin/login', req.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}
