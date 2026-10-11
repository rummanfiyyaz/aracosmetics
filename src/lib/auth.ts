export const ADMIN_COOKIE = 'admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const encoder = new TextEncoder()

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let str = ''
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(new ArrayBuffer(bin.length))
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signSession(expiresAtMs: number, secret: string): Promise<string> {
  const payload = String(expiresAtMs)
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return `${payload}.${toBase64Url(sig)}`
}

export async function verifySession(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sigB64] = parts
  const expiresAtMs = Number(payload)
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) return false
  try {
    const key = await getKey(secret)
    const sig = fromBase64Url(sigB64)
    return await crypto.subtle.verify('HMAC', key, sig, encoder.encode(payload))
  } catch {
    return false
  }
}
