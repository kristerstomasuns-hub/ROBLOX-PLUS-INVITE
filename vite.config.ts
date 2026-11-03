import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { fetchAdBlueOffers } from './server/offers.ts'
import { lookupRobloxUser } from './server/roblox.ts'

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => {
      body += chunk
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

async function handleVerify(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.end()
    return
  }

  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  let username = ''
  try {
    const body = JSON.parse(await readBody(request)) as { username?: unknown }
    username = typeof body.username === 'string' ? body.username : ''
  } catch {
    response.statusCode = 400
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Invalid request body.' }))
    return
  }

  const result = await lookupRobloxUser(username)
  response.statusCode = result.status
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(result.body))
}

async function handleOffers(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== 'GET') {
    response.statusCode = 405
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const url = new URL(request.url ?? '/', 'http://localhost')
  const code = url.searchParams.get('s1') ?? 'guest'
  const userAgentHeader = request.headers['user-agent']
  const userAgent = Array.isArray(userAgentHeader)
    ? userAgentHeader[0]
    : userAgentHeader
  const ip = request.socket.remoteAddress?.replace(/^::ffff:/, '')

  try {
    const offers = await fetchAdBlueOffers({ code, ip, userAgent })
    response.statusCode = 200
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ offers }))
  } catch {
    response.statusCode = 502
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Offers are unavailable right now.' }))
  }
}

function plusDropApi(): Plugin {
  return {
    configurePreviewServer(server) {
      server.middlewares.use('/api/verify', handleVerify)
      server.middlewares.use('/api/offers', handleOffers)
    },
    configureServer(server) {
      server.middlewares.use('/api/verify', handleVerify)
      server.middlewares.use('/api/offers', handleOffers)
    },
    name: 'plusdrop-api',
  }
}

export default defineConfig({
  plugins: [react(), plusDropApi()],
})
