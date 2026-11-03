import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { claimedCount } from '../lib/claims'
import { motionTokens, useMotionPresets } from '../motion/tokens'

type ClaimProgressProps = {
  claimed: number
  total: number
}

export function ClaimProgress({ claimed, total }: ClaimProgressProps) {
  const { reduced } = useMotionPresets()
  const [currentClaimed, setCurrentClaimed] = useState(() =>
    claimedCount(claimed, total),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentClaimed(claimedCount(claimed, total))
    }, 30000)

    return () => window.clearInterval(timer)
  }, [claimed, total])

  const safeTotal = Math.max(total, 1)
  const safeClaimed = Math.min(Math.max(currentClaimed, 0), safeTotal)
  const percent = (safeClaimed / safeTotal) * 100
  const remaining = safeTotal - safeClaimed

  return (
    <div className="mx-auto w-full">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-medium text-soft">
          <span className="font-bold text-ink">
            {safeClaimed}/{safeTotal}
          </span>{' '}
          invite links claimed
        </p>
        <p className="text-[11px] text-muted">{remaining} left in this batch</p>
      </div>

      <div
        aria-label={`${safeClaimed} of ${safeTotal} invite links claimed`}
        aria-valuemax={safeTotal}
        aria-valuemin={0}
        aria-valuenow={safeClaimed}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e5ebfa]"
        role="progressbar"
      >
        <motion.div
          animate={{ width: `${percent}%` }}
          className="h-full rounded-full bg-accent"
          initial={reduced ? { width: `${percent}%` } : { width: 0 }}
          transition={{
            delay: 0.1,
            duration: motionTokens.duration.reveal,
            ease: motionTokens.ease.enter,
          }}
        />
      </div>
    </div>
  )
}
