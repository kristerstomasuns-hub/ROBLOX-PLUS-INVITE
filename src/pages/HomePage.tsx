import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ClaimProgress } from '../components/ClaimProgress'
import { InviteModal } from '../components/InviteModal'
import { PlusBenefits } from '../components/PlusBenefits'
import { SeoFaq } from '../components/SeoFaq'
import { INVITE_ALLOCATION, SITE } from '../config'
import { readOrCreateCode } from '../lib/storage'
import { motionTokens, useMotionPresets } from '../motion/tokens'

export function HomePage() {
  const [code] = useState(readOrCreateCode)
  const [modalOpen, setModalOpen] = useState(false)
  const { fadeUp, scaleIn, staggerContainer } = useMotionPresets()

  return (
    <>
      <div className="relative overflow-hidden pb-14">
        <motion.div
          animate={{ opacity: 1 }}
          aria-hidden="true"
          className="plus-hero-texture"
          initial={{ opacity: 0 }}
          transition={{
            duration: motionTokens.duration.reveal,
            ease: motionTokens.ease.enter,
          }}
        />

        <div className="plus-shell relative z-10 pt-10 sm:pt-14">
          <motion.div
            animate="visible"
            initial="hidden"
            variants={staggerContainer}
          >
            <motion.div
              className="flex flex-col items-center text-center"
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink">
                <img
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5"
                  src="/plus/roblox-plus.svg"
                />
                Roblox Plus
              </span>
              <h1
                aria-label={SITE.h1}
                className="mt-3 text-[clamp(1.75rem,5.5vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink"
              >
                <span className="block">Join me on Roblox Plus</span>{' '}
                <span className="block">for 30 days free</span>
              </h1>
            </motion.div>

            <motion.p
              className="mx-auto mt-4 max-w-[48ch] text-center text-[14px] leading-6 text-soft"
              variants={fadeUp}
            >
              {SITE.sub}
            </motion.p>

            <motion.div
              className="mt-6 flex justify-center"
              variants={scaleIn}
            >
              <button
                aria-haspopup="dialog"
                className="button-primary w-[230px] max-w-full"
                data-testid="get-invite"
                onClick={() => setModalOpen(true)}
                type="button"
              >
                Get Invite
              </button>
            </motion.div>

            <motion.div className="mt-6" variants={fadeUp}>
              <ClaimProgress
                claimed={INVITE_ALLOCATION.claimed}
                total={INVITE_ALLOCATION.total}
              />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <PlusBenefits />
        </div>
      </div>

      <SeoFaq />

      <AnimatePresence>
        {modalOpen ? (
          <InviteModal
            code={code}
            key="invite-modal"
            onClose={() => setModalOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
