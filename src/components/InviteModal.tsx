import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { fetchAdBlueOffersJsonp, type AdBlueOffer } from '../lib/adblue'
import { motionTokens, useMotionPresets } from '../motion/tokens'

type InviteModalProps = {
  code: string
  onClose: () => void
}

type RobloxProfile = {
  id: number
  username: string
  displayName: string
  avatarUrl: string | null
}

type VerifyResponse = {
  eligible?: boolean
  user?: RobloxProfile
  error?: string
}

type Stage = 'username' | 'profile' | 'loading' | 'human' | 'verifying' | 'offers'

type OffersResponse = {
  offers?: AdBlueOffer[]
  error?: string
}

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

function OfferIcon({ name, src }: { name: string; src: string | null }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-line bg-white text-[12px] font-bold text-muted">
      {name.slice(0, 1).toUpperCase()}
      {src && !failed ? (
        <img
          alt=""
          className={[
            'absolute inset-0 h-full w-full object-contain p-1 transition-opacity duration-[240ms]',
            loaded ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          height={36}
          onError={() => {
            setFailed(true)
            setLoaded(false)
          }}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
          src={src}
          width={36}
        />
      ) : null}
    </span>
  )
}

function ButtonDots({
  large = false,
  reduced,
}: {
  large?: boolean
  reduced: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={['flex items-center', large ? 'gap-2.5' : 'gap-1.5'].join(' ')}
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          animate={
            reduced
              ? { opacity: [0.4, 1, 0.4] }
              : {
                  opacity: [0.25, 1, 0.25],
                  scale: large ? [0.9, 1, 0.9] : [0.85, 1, 0.85],
                }
          }
          className={[
            'block rounded-[1px] bg-current',
            large ? 'h-3 w-3' : 'h-2 w-2',
          ].join(' ')}
          initial={
            reduced
              ? { opacity: 0.4 }
              : { opacity: 0.25, scale: large ? 0.9 : 0.85 }
          }
          key={index}
          transition={{
            delay: index * 0.14,
            duration: reduced ? 1.4 : 0.9,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      ))}
    </span>
  )
}

function LoadingRing({ reduced }: { reduced: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-12 items-center justify-center gap-2.5"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          animate={
            reduced
              ? { opacity: [0.4, 1, 0.4] }
              : { opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }
          }
          className="block h-5 w-5 rounded-[1px] bg-[#55585c]"
          initial={reduced ? { opacity: 0.4 } : { opacity: 0.25, scale: 0.85 }}
          key={index}
          transition={{
            delay: index * 0.14,
            duration: reduced ? 1.4 : 0.9,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  )
}

export function InviteModal({ code, onClose }: InviteModalProps) {
  const { reduced } = useMotionPresets()
  const [stage, setStage] = useState<Stage>('username')
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState<RobloxProfile | null>(null)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [offers, setOffers] = useState<AdBlueOffer[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offersError, setOffersError] = useState<string | null>(null)
  const [offersReload, setOffersReload] = useState(0)
  const [startedOfferIds, setStartedOfferIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [offerOpenError, setOfferOpenError] = useState<string | null>(null)
  const [continueLoading, setContinueLoading] = useState(false)
  const [continueError, setContinueError] = useState<string | null>(null)
  const continueTimerRef = useRef<number | null>(null)
  const hasStartedOffers = startedOfferIds.size > 0
  const aliveRef = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const profileHeadingRef = useRef<HTMLHeadingElement>(null)
  const loadingHeadingRef = useRef<HTMLHeadingElement>(null)
  const offersHeadingRef = useRef<HTMLHeadingElement>(null)
  const verifyButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    aliveRef.current = true
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled])',
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      aliveRef.current = false
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previous?.focus()
    }
  }, [onClose])

  useEffect(() => {
    if (stage === 'profile') profileHeadingRef.current?.focus()
    if (stage === 'loading' || stage === 'verifying') {
      loadingHeadingRef.current?.focus()
    }
    if (stage === 'human') verifyButtonRef.current?.focus()
    if (stage === 'offers') offersHeadingRef.current?.focus()
  }, [stage])

  useEffect(() => {
    if (stage === 'loading') {
      const timer = window.setTimeout(() => setStage('human'), 1800)
      return () => window.clearTimeout(timer)
    }

    if (stage === 'verifying') {
      const timer = window.setTimeout(() => {
        if (aliveRef.current) {
          setOffersLoading(true)
          setStage('offers')
        }
      }, 2500)
      return () => window.clearTimeout(timer)
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'offers') return

    const controller = new AbortController()
    let alive = true

    async function loadOffers() {
      setOffersLoading(true)
      setOffersError(null)

      try {
        let nextOffers: AdBlueOffer[] = []
        let serverOk = false
        let serverError: Error | null = null

        try {
          const response = await fetch(
            `/api/offers?s1=${encodeURIComponent(code)}`,
            { cache: 'no-store', signal: controller.signal },
          )
          const payload = (await response.json().catch(() => null)) as
            | OffersResponse
            | null

          if (!response.ok) {
            throw new Error(payload?.error ?? 'Offers are unavailable.')
          }

          if (!payload || !Array.isArray(payload.offers)) {
            throw new Error(
              payload?.error ??
                'The offers API is unavailable. Restart the dev server or redeploy, then try again.',
            )
          }

          serverOk = true
          nextOffers = payload.offers
        } catch (loadError) {
          if (!alive || controller.signal.aborted) return
          serverError =
            loadError instanceof Error
              ? loadError
              : new Error('Offers are unavailable.')
        }

        if (nextOffers.length === 0) {
          try {
            nextOffers = await fetchAdBlueOffersJsonp(code)
          } catch (fallbackError) {
            if (!serverOk) {
              throw (
                serverError ??
                (fallbackError instanceof Error
                  ? fallbackError
                  : new Error('Offers are unavailable.'))
              )
            }
          }
        }

        if (alive) setOffers(nextOffers)
      } catch (loadError) {
        if (!alive || controller.signal.aborted) return
        setOffersError(
          loadError instanceof Error
            ? loadError.message
            : 'Offers are unavailable right now.',
        )
      } finally {
        if (alive) setOffersLoading(false)
      }
    }

    void loadOffers()

    return () => {
      alive = false
      controller.abort()
    }
  }, [code, offersReload, stage])

  useEffect(
    () => () => {
      if (continueTimerRef.current !== null) {
        window.clearTimeout(continueTimerRef.current)
      }
    },
    [],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const value = username.trim()

    if (!USERNAME_PATTERN.test(value)) {
      setError('Use 3–20 letters, numbers, or underscores.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/verify', {
        body: JSON.stringify({ username: value }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const payload = (await response.json().catch(() => null)) as
        | VerifyResponse
        | null

      if (!aliveRef.current) return

      if (!response.ok) {
        setError(payload?.error ?? 'Could not check that username. Try again.')
        setSubmitting(false)
        return
      }

      if (!payload?.user) {
        setError('We could not find that Roblox username.')
        setSubmitting(false)
        return
      }

      if (payload.eligible === false) {
        setError('That username is not eligible for the invite.')
        setSubmitting(false)
        return
      }

      setProfile(payload.user)
      setAvatarFailed(false)
      setAvatarLoaded(false)
      setStage('profile')
      setSubmitting(false)
    } catch {
      if (aliveRef.current) {
        setError('Could not check that username. Try again.')
        setSubmitting(false)
      }
    }
  }

  function handleBack() {
    setProfile(null)
    setStage('username')
    setAvatarFailed(false)
    setAvatarLoaded(false)
    setError(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleHumanVerified() {
    setStage('verifying')
  }

  function startOffer(offer: AdBlueOffer) {
    setOfferOpenError(null)
    setContinueError(null)
    const opened = window.open(offer.url, '_blank')
    if (!opened) {
      setOfferOpenError(
        'Allow pop-ups for this site, then press Start again. Your current tab will stay here.',
      )
      return
    }

    opened.opener = null
    setStartedOfferIds((current) => {
      if (current.has(offer.id)) return current
      const next = new Set(current)
      next.add(offer.id)
      return next
    })
  }

  function handleContinue() {
    if (continueLoading) return
    setContinueError(null)

    setContinueLoading(true)
    continueTimerRef.current = window.setTimeout(() => {
      continueTimerRef.current = null
      setContinueLoading(false)
      setContinueError('Please complete an offer before continuing.')
    }, 5000)
  }

  return createPortal(
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgba(10,10,14,0.5)] p-5"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
      transition={{
        duration: motionTokens.duration.pageExit,
        ease: motionTokens.ease.exit,
      }}
    >
      <motion.div
        aria-busy={
          submitting ||
          stage === 'loading' ||
          stage === 'verifying' ||
          (stage === 'offers' && offersLoading)
        }
        aria-describedby="invite-modal-description"
        aria-labelledby="invite-modal-title"
        aria-modal="true"
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        className="relative max-h-[calc(100dvh-40px)] w-full max-w-[400px] overflow-y-auto rounded-[8px] border border-line bg-white p-5 sm:p-6"
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 4 }}
        initial={
          reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }
        }
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        transition={{
          duration: motionTokens.duration.standard,
          ease: motionTokens.ease.enter,
        }}
      >
        <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
          <img
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
            src="/plus/roblox-plus.svg"
          />
          Roblox Plus
        </div>

        <button
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-[6px] text-[#5f6b7a] transition-colors duration-[140ms] hover:bg-[#f2f4f7] hover:text-ink"
          onClick={onClose}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: reduced ? 0 : 6 }}
          key={stage}
          transition={{
            duration: motionTokens.duration.standard,
            ease: motionTokens.ease.enter,
          }}
        >
          {stage === 'username' ? (
            <>
              <h2
                className="mt-4 text-[20px] font-bold tracking-[-0.02em] text-ink"
                id="invite-modal-title"
              >
                Enter your Roblox username
              </h2>
              <p
                className="mt-1.5 text-[12px] leading-5 text-soft"
                id="invite-modal-description"
              >
                We&apos;ll look up your Roblox account, then send you to the
                invite. No password, no card.
              </p>

              <form className="mt-5" noValidate onSubmit={handleSubmit}>
                <label
                  className="text-[11px] font-semibold text-ink"
                  htmlFor="invite-username"
                >
                  Roblox username
                </label>
                <input
                  aria-describedby={
                    error ? 'invite-username-error' : undefined
                  }
                  aria-invalid={error ? true : undefined}
                  autoCapitalize="none"
                  autoComplete="off"
                  className={[
                    'mt-1.5 h-10 w-full rounded-[8px] border bg-[#f2f5ff] px-3 text-[13px] text-ink placeholder:text-muted',
                    error ? 'border-danger' : 'border-[#c9d5f5]',
                  ].join(' ')}
                  disabled={submitting}
                  id="invite-username"
                  inputMode="text"
                  maxLength={20}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Username"
                  ref={inputRef}
                  spellCheck={false}
                  value={username}
                />
                {error ? (
                  <p
                    className="mt-1.5 text-[11px] leading-4 text-danger"
                    id="invite-username-error"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                  <button
                    className="button-secondary w-full sm:w-auto"
                    onClick={onClose}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? 'Checking...' : 'Continue'}
                  </button>
                </div>
              </form>
            </>
          ) : null}

          {stage === 'profile' && profile ? (
            <div className="mt-4 flex flex-col items-center text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-line bg-panel">
                <span className="absolute inset-0 flex items-center justify-center text-[28px] font-bold text-muted">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </span>
                {profile.avatarUrl && !avatarFailed ? (
                  <img
                    alt={`${profile.displayName}'s Roblox avatar`}
                    className={[
                      'relative h-full w-full object-cover transition-opacity duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)]',
                      avatarLoaded ? 'opacity-100' : 'opacity-0',
                    ].join(' ')}
                    onError={() => {
                      setAvatarFailed(true)
                      setAvatarLoaded(false)
                    }}
                    onLoad={() => setAvatarLoaded(true)}
                    src={profile.avatarUrl}
                  />
                ) : null}
              </div>

              <h2
                className="mt-4 text-[20px] font-bold tracking-[-0.02em] text-ink"
                id="invite-modal-title"
                ref={profileHeadingRef}
                style={{ outline: 'none' }}
                tabIndex={-1}
              >
                Is this you?
              </h2>
              <p
                className="mt-1.5 text-[12px] leading-5 text-soft"
                id="invite-modal-description"
              >
                We found this Roblox account. Confirm to continue to the
                invite.
              </p>

              <div className="mt-4 w-full rounded-[8px] border border-line bg-panel px-3 py-2.5">
                <p className="text-[13px] font-bold text-ink">
                  {profile.displayName}
                </p>
                <p className="text-[11px] leading-4 text-muted">
                  @{profile.username}
                </p>
              </div>

              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <button
                  aria-label="No, not me"
                  className="button-secondary w-full"
                  onClick={handleBack}
                  type="button"
                >
                  No
                </button>
                <button
                  aria-label="Yes, that's me"
                  className="button-primary w-full"
                  onClick={() => setStage('loading')}
                  type="button"
                >
                  Yes
                </button>
              </div>
            </div>
          ) : null}

          {stage === 'loading' || stage === 'verifying' ? (
            <div className="mt-4 flex flex-col items-center text-center">
              <LoadingRing reduced={reduced} />
              <h2
                className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-ink"
                id="invite-modal-title"
                ref={loadingHeadingRef}
                style={{ outline: 'none' }}
                tabIndex={-1}
              >
                {stage === 'loading'
                  ? 'Checking your account'
                  : "Verifying you're a human"}
              </h2>
              <p
                className="mt-1.5 text-[12px] leading-5 text-soft"
                id="invite-modal-description"
              >
                {stage === 'loading'
                  ? 'Hold tight for a second.'
                  : 'Keep this window open while we finish.'}
              </p>
            </div>
          ) : null}

          {stage === 'human' ? (
            <div className="mt-6 flex flex-col items-center text-center">
              <h2
                className="text-[20px] font-bold tracking-[-0.02em] text-ink"
                id="invite-modal-title"
              >
                One last step
              </h2>
              <p
                className="mt-1.5 text-[12px] leading-5 text-soft"
                id="invite-modal-description"
              >
                Verify you&apos;re a human to open the invite.
              </p>
              <button
                className="button-primary mt-5 w-full"
                onClick={handleHumanVerified}
                ref={verifyButtonRef}
                type="button"
              >
                Verify you&apos;re a human
              </button>
            </div>
          ) : null}

          {stage === 'offers' ? (
            <div className="mt-4">
              <div className="text-center">
                <h2
                  className="text-[20px] font-bold tracking-[-0.02em] text-ink"
                  id="invite-modal-title"
                  ref={offersHeadingRef}
                  style={{ outline: 'none' }}
                  tabIndex={-1}
                >
                  Choose an offer
                </h2>
                <p
                  className="mx-auto mt-1.5 max-w-[32ch] text-[12px] leading-5 text-soft"
                  id="invite-modal-description"
                >
                  Pick one offer. It opens in a new tab. Come back here after
                  completing the offer.
                </p>
              </div>

              {hasStartedOffers ? (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
                  Checking for offer completion…
                </p>
              ) : null}

              {offersLoading ? (
                <div className="flex flex-col items-center gap-2 py-5">
                  <LoadingRing reduced={reduced} />
                  <p className="text-[11px] text-muted">Loading offers…</p>
                </div>
              ) : null}

              {!offersLoading && offersError ? (
                <div className="mt-4 rounded-[8px] border border-line bg-panel p-4 text-center">
                  <p className="text-[12px] font-semibold text-ink">
                    Offers couldn&apos;t load.
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-soft">
                    {offersError}
                  </p>
                  <button
                    className="button-secondary mt-3"
                    onClick={() => setOffersReload((value) => value + 1)}
                    type="button"
                  >
                    Try again
                  </button>
                </div>
              ) : null}

              {!offersLoading && !offersError && offers.length === 0 ? (
                <div className="mt-4 rounded-[8px] border border-line bg-panel p-4 text-center">
                  <p className="text-[12px] font-semibold text-ink">
                    No offers available right now.
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-soft">
                    Refresh once, or continue to your invite below.
                  </p>
                  <button
                    className="button-secondary mt-3"
                    onClick={() => setOffersReload((value) => value + 1)}
                    type="button"
                  >
                    Refresh offers
                  </button>
                </div>
              ) : null}

              {!offersLoading && !offersError && offers.length > 0 ? (
                <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {offers.map((offer) => (
                    <div
                      className="flex items-center gap-2.5 rounded-[8px] border border-line bg-panel p-2.5"
                      key={offer.id}
                    >
                      <OfferIcon name={offer.name} src={offer.icon} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-ink">
                          {offer.name}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-soft">
                          {offer.description}
                        </p>
                      </div>
                      <a
                        aria-label={
                          startedOfferIds.has(offer.id)
                            ? 'Offer opened in a new tab'
                            : `Start ${offer.name}`
                        }
                        className="button-secondary flex min-w-[58px] shrink-0 items-center justify-center"
                        href={offer.url}
                        onClick={(event) => {
                          event.preventDefault()
                          startOffer(offer)
                        }}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {startedOfferIds.has(offer.id) ? (
                          <ButtonDots reduced={reduced} />
                        ) : (
                          'Start'
                        )}
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}

              {offerOpenError ? (
                <p
                  className="mt-3 text-center text-[10px] leading-4 text-danger"
                  role="alert"
                >
                  {offerOpenError}
                </p>
              ) : null}

              <div className="mt-4 border-t border-line pt-4">
                {continueError ? (
                  <p
                    className="mb-2 text-center text-[12px] font-medium leading-5 text-danger"
                    role="alert"
                  >
                    {continueError}
                  </p>
                ) : null}

                <button
                  aria-busy={continueLoading}
                  aria-label={
                    continueLoading ? 'Checking offer completion' : undefined
                  }
                  className={[
                    'flex w-full items-center justify-center',
                    continueLoading
                      ? 'button-loading cursor-wait'
                      : 'button-primary',
                  ].join(' ')}
                  disabled={continueLoading}
                  onClick={handleContinue}
                  type="button"
                >
                  {continueLoading ? (
                    <ButtonDots large reduced={reduced} />
                  ) : (
                    "I've completed an offer"
                  )}
                </button>
                <p className="mt-2 text-center text-[10px] leading-4 text-muted">
                  Your invite is saved in this browser.
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
