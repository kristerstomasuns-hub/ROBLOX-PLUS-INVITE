import { lookupRobloxUser } from '../server/roblox.ts'

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, headers)
  }

  let username = ''
  try {
    const body = (await request.json()) as { username?: unknown }
    username = typeof body.username === 'string' ? body.username : ''
  } catch {
    return json({ error: 'Invalid request body.' }, 400, headers)
  }

  const result = await lookupRobloxUser(username)
  return json(result.body, result.status, headers)
}
