const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/
const LOOKUP_URL = 'https://users.roblox.com/v1/usernames/users'
const HEADSHOT_URL = 'https://thumbnails.roblox.com/v1/users/avatar-headshot'

const DEFAULT_ORIGINS = 'https://yourdomain.com,http://localhost:3000'

type RobloxLookup = {
  data?: Array<{
    id: number
    name: string
    displayName: string
  }>
}

type RobloxThumbnails = {
  data?: Array<{
    imageUrl?: string | null
  }>
}

type LookupResult = {
  status: number
  body: unknown
}

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

async function lookupRobloxUser(usernameInput: string): Promise<LookupResult> {
  const username = usernameInput.trim()

  if (!USERNAME_PATTERN.test(username)) {
    return {
      body: {
        error:
          'Use a valid Roblox username (3–20 letters, numbers, or underscores).',
      },
      status: 400,
    }
  }

  try {
    const lookupPromise = fetch(LOOKUP_URL, {
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const [lookupResponse] = await Promise.all([
      lookupPromise,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ])

    if (!lookupResponse.ok) {
      return { body: { error: 'Roblox lookup failed.' }, status: 502 }
    }

    const lookup = (await lookupResponse.json()) as RobloxLookup
    const user = lookup.data?.[0]

    if (!user) {
      return {
        body: { error: 'We could not find that Roblox username.' },
        status: 404,
      }
    }

    let avatarUrl: string | null = null
    try {
      const thumbResponse = await fetch(
        `${HEADSHOT_URL}?userIds=${user.id}&size=420x420&format=Png&isCircular=false`,
        { cache: 'no-store' },
      )
      if (thumbResponse.ok) {
        const thumbnails = (await thumbResponse.json()) as RobloxThumbnails
        avatarUrl = thumbnails.data?.[0]?.imageUrl ?? null
      }
    } catch {
      avatarUrl = null
    }

    return {
      body: {
        eligible: true,
        region: 'supported',
        user: {
          id: user.id,
          username: user.name,
          displayName: user.displayName,
          avatarUrl,
        },
      },
      status: 200,
    }
  } catch {
    return {
      body: { error: 'Could not reach Roblox. Try again.' },
      status: 502,
    }
  }
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
