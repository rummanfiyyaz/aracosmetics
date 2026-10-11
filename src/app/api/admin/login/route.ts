import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from '@/lib/auth'

export async function POST(req: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!secret || !expectedUser || !expectedPass) {
    return NextResponse.json(
      { error: 'Admin auth is not configured on the server.' },
      { status: 500 },
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const username = (body.username ?? '').trim()
  const password = body.password ?? ''

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const token = await signSession(expiresAt, secret)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return res
}
