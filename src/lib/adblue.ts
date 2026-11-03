const OFFER_FEED_URL =
  'https://d3r33tlb373kwk.cloudfront.net/public/offers/feed.php'

// Public AdBlueMedia offers key. The private account key is never shipped here.
const OFFER_FEED_USER_ID = '623910'
const OFFER_FEED_API_KEY = '525aedb31fa76c26997f25d2b15e501f'
const OFFER_LIMIT = 5
// Used only to top up a thin geo result; the feed still owns the offers.
const FALLBACK_GEO_IP = '8.8.8.8'

export type AdBlueOffer = {
  id: string
  name: string
  description: string
  icon: string | null
  url: string
}

type RawOffer = {
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

let callbackId = 0

function jsonpRequest<T>(url: string, timeoutMs = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = `__adblue_jsonp_${Date.now()}_${callbackId++}`
    const script = document.createElement('script')
    const globals = window as unknown as Record<string, unknown>
    let settled = false
    let timer: number | undefined

    const cleanup = () => {
      window.clearTimeout(timer)
      delete globals[callback]
      script.remove()
    }

    const finish = (value: T | null, error?: Error) => {
      if (settled) return
      settled = true
      cleanup()
      if (error) reject(error)
      else resolve(value as T)
    }

    globals[callback] = (value: T) => finish(value)

    const requestUrl = new URL(url)
    requestUrl.searchParams.set('callback', callback)

    script.async = true
    script.src = requestUrl.toString()
    script.onerror = () => finish(null, new Error('AdBlue request failed.'))
    document.body.appendChild(script)

    timer = window.setTimeout(
      () => finish(null, new Error('AdBlue request timed out.')),
      timeoutMs,
    )
  })
}

function safeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function normalizeOffer(raw: RawOffer, index: number): AdBlueOffer | null {
  const url = safeHttpsUrl(raw.url)
  if (!url) return null

  return {
    id: safeText(raw.id, 64) || `offer-${index}`,
    name: safeText(raw.name, 80) || 'Offer',
    description:
      safeText(raw.conversion, 160) ||
      safeText(raw.anchor, 160) ||
      'Complete this offer to continue.',
    icon:
      safeHttpsUrl(raw.network_icon) ??
      safeHttpsUrl(raw.icon) ??
      safeHttpsUrl(raw.offerphoto) ??
      safeHttpsUrl(raw.image),
    url,
  }
}

export async function fetchAdBlueOffersJsonp(
  code: string,
): Promise<AdBlueOffer[]> {
  async function requestFeed(ipOverride?: string): Promise<AdBlueOffer[]> {
    const url = new URL(OFFER_FEED_URL)
    url.searchParams.set('user_id', OFFER_FEED_USER_ID)
    url.searchParams.set('api_key', OFFER_FEED_API_KEY)
    url.searchParams.set('limit', '10')
    url.searchParams.set('s1', code)
    url.searchParams.set('s2', '')
    if (ipOverride) url.searchParams.set('ip', ipOverride)

    const data = await jsonpRequest<RawOffer[] | { offers?: RawOffer[] }>(
      url.toString(),
    )
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.offers)
        ? data.offers
        : []

    return items
      .map((item, index) =>
        item && typeof item === 'object' ? normalizeOffer(item, index) : null,
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
    offers = await requestFeed()
  } catch (error) {
    primaryError = error
  }

  if (offers.length < OFFER_LIMIT) {
    try {
      const wider = await requestFeed(FALLBACK_GEO_IP)
      offers = mergeOffers(offers, wider)
    } catch {
      // Keep whatever the primary request returned.
    }
  }

  if (offers.length === 0) {
    try {
      const fallback = await requestFeed()
      offers = mergeOffers(offers, fallback)
    } catch (error) {
      throw primaryError ?? error
    }
  }

  return offers.slice(0, OFFER_LIMIT)
}
