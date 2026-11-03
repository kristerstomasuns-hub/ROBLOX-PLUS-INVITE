const DEFAULT_FEED_URL =
  'https://d3r33tlb373kwk.cloudfront.net/public/offers/feed.php'
const DEFAULT_FEED_USER_ID = '623910'
const DEFAULT_FEED_API_KEY = '525aedb31fa76c26997f25d2b15e501f'
const OFFER_LIMIT = 5
// Used only to widen a thin geo result; the feed still owns the offer list.
const FALLBACK_GEO_IP = '8.8.8.8'

export type AdBlueOffer = {
  id: string
  name: string
  description: string
  icon: string | null
  url: string
}

type FeedOffer = {
  id?: unknown
  name?: unknown
  conversion?: unknown
  anchor?: unknown
  network_icon?: unknown
  icon?: unknown
  offerphoto?: unknown
  image?: unknown
  url?: unknown
}

type FeedResponse = {
  offers?: unknown
}

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

function safeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function publicIp(value?: string): string | undefined {
  if (!value) return undefined
  const ip = value.trim().replace(/^::ffff:/, '')
  if (!ip) return undefined
  if (ip === '::1' || ip === '127.0.0.1') return undefined
  if (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^(fc|fd|fe80:)/i.test(ip)
  ) {
    return undefined
  }
  return ip
}

function normalizeOffer(raw: FeedOffer, index: number): AdBlueOffer | null {
  const url = safeHttpUrl(raw.url)
  if (!url) return null

  return {
    id: safeText(raw.id, 64) || `offer-${index}`,
    name: safeText(raw.name, 80) || 'Offer',
    description:
      safeText(raw.conversion, 160) ||
      safeText(raw.anchor, 160) ||
      'Complete this offer to continue.',
    icon:
      safeHttpUrl(raw.network_icon) ??
      safeHttpUrl(raw.icon) ??
      safeHttpUrl(raw.offerphoto) ??
      safeHttpUrl(raw.image),
    url,
  }
}

export async function fetchAdBlueOffers({
  code,
  ip,
  userAgent,
}: {
  code: string
  ip?: string
  userAgent?: string
}): Promise<AdBlueOffer[]> {
  const feedUrl =
    process.env.OFFER_FEED_URL?.trim() || DEFAULT_FEED_URL
  const feedUserId =
    process.env.OFFER_FEED_USER_ID?.trim() || DEFAULT_FEED_USER_ID
  const feedApiKey =
    process.env.OFFER_FEED_API_KEY?.trim() || DEFAULT_FEED_API_KEY
  const clientIp = publicIp(ip)

  async function requestOffers({
    includeClient,
    ipOverride,
  }: {
    includeClient: boolean
    ipOverride?: string
  }) {
    const url = new URL(feedUrl)
    url.searchParams.set('user_id', feedUserId)
    url.searchParams.set('api_key', feedApiKey)
    url.searchParams.set('limit', '10')
    url.searchParams.set(
      's1',
      code.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || 'guest',
    )
    url.searchParams.set('s2', '')

    const requestIp = ipOverride ?? (includeClient ? clientIp : undefined)
    if (requestIp) url.searchParams.set('ip', requestIp)
    if (includeClient && userAgent) {
      url.searchParams.set('user_agent', userAgent)
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Offer feed failed with ${response.status}`)
    }

    const data = (await response.json()) as FeedOffer[] | FeedResponse
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data.offers)
        ? data.offers
        : []

    return items
      .map((item, index) =>
        item && typeof item === 'object'
          ? normalizeOffer(item as FeedOffer, index)
          : null,
      )
      .filter((offer): offer is AdBlueOffer => offer !== null)
  }

  function mergeOffers(...groups: AdBlueOffer[][]): AdBlueOffer[] {
    const merged = new Map<string, AdBlueOffer>()
    for (const group of groups) {
      for (const offer of group) {
        if (!merged.has(offer.url)) merged.set(offer.url, offer)
      }
    }
    return Array.from(merged.values())
  }

  let offers: AdBlueOffer[] = []
  let primaryError: unknown = null

  try {
    offers = await requestOffers({ includeClient: true })
  } catch (error) {
    primaryError = error
  }

  if (offers.length < OFFER_LIMIT) {
    try {
      const wider = await requestOffers({
        includeClient: false,
        ipOverride: FALLBACK_GEO_IP,
      })
      offers = mergeOffers(offers, wider)
    } catch {
      // Keep whatever the primary request returned.
    }
  }

  if (offers.length === 0) {
    try {
      const fallback = await requestOffers({ includeClient: false })
      offers = mergeOffers(offers, fallback)
    } catch (error) {
      throw primaryError ?? error
    }
  }

  return offers.slice(0, OFFER_LIMIT)
}
