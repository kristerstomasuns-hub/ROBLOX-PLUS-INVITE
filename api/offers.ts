import { fetchAdBlueOffers } from '../server/offers.ts'

const DEFAULT_ORIGINS = 'https://yourdomain.com,http://localhost:3000'

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && allowedOrigins.includes(origin) ? origin : ''

  return {
    ...(allowed ? { 'Access-Control-Allow-Origin': allowed } : {}),
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  }
}

function json(
  body: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      ...headers,
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
    status,
  })
}

export const config = {
  maxDuration: 10,
}

export default async function handler(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 })
  }

  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, headers)
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('s1') ?? 'guest'
  const forwardedFor = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwardedFor.split(',')[0]?.trim() || undefined
  const userAgent = request.headers.get('user-agent') ?? undefined

  try {
    const offers = await fetchAdBlueOffers({ code, ip, userAgent })
    return json({ offers }, 200, headers)
  } catch {
    return json({ error: 'Offers are unavailable right now.' }, 502, headers)
  }
}
