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

type ApiRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

type ApiResponse = {
  status(code: number): ApiResponse
  setHeader(name: string, value: string): void
  json(body: unknown): void
  end(): void
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function getOrigin(request: ApiRequest): string | null {
  const origin = request.headers.origin
  if (Array.isArray(origin)) return origin[0] ?? null
  return origin ?? null
}

function applyCors(response: ApiResponse, origin: string | null): void {
  const allowed = origin && allowedOrigins.includes(origin) ? origin : ''
  if (allowed) response.setHeader('Access-Control-Allow-Origin', allowed)
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Vary', 'Origin')
}

function sendJson(
  response: ApiResponse,
  status: number,
  body: unknown,
  origin: string | null,
): void {
  applyCors(response, origin)
  response.status(status)
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json')
  response.json(body)
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

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
): Promise<void> {
  const origin = getOrigin(request)
  const method = request.method?.toUpperCase() ?? 'GET'

  if (method === 'OPTIONS') {
    applyCors(response, origin)
    response.status(204).end()
    return
  }

  if (method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' }, origin)
    return
  }

  let body: unknown = request.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      sendJson(response, 400, { error: 'Invalid request body.' }, origin)
      return
    }
  }

  const payload =
    body && typeof body === 'object'
      ? (body as { username?: unknown })
      : null
  const username =
    payload && typeof payload.username === 'string' ? payload.username : ''

  const result = await lookupRobloxUser(username)
  sendJson(response, result.status, result.body, origin)
}
