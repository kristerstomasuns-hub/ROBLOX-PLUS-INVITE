const CLAIM_START_KEY = 'pd_claim_start_v2'
const CLAIM_STEP_MS = 10 * 60 * 1000

let fallbackStart: number | null = null

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getStartAt(now: number): number {
  const storage = getStorage()

  if (storage) {
    try {
      const stored = Number(storage.getItem(CLAIM_START_KEY))
      if (Number.isFinite(stored) && stored > 0) return stored

      storage.setItem(CLAIM_START_KEY, String(now))
      return now
    } catch {
      // Fall through to the in-memory clock.
    }
  }

  if (fallbackStart === null) fallbackStart = now
  return fallbackStart
}

export function claimedCount(claimed: number, total: number): number {
  const now = Date.now()
  const startAt = getStartAt(now)
  const steps = Math.max(0, Math.floor((now - startAt) / CLAIM_STEP_MS))
  const safeTotal = Math.max(total, 1)

  return Math.min(Math.max(claimed, 0) + steps, safeTotal)
}
