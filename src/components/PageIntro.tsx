import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMotionPresets } from '../motion/tokens'

type PageIntroProps = {
  eyebrow: string
  title: string
  children: ReactNode
}

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  const { fadeUp, staggerContainer } = useMotionPresets()

  return (
    <motion.div
      animate="visible"
      className="flex flex-col gap-3"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.p className="eyebrow" variants={fadeUp}>
        {eyebrow}
      </motion.p>
      <motion.h1
        className="max-w-[15ch] text-[clamp(1.9rem,6.5vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.025em] text-ink"
        variants={fadeUp}
      >
        {title}
      </motion.h1>
      <motion.p
        className="max-w-[50ch] text-[13px] leading-6 text-soft sm:text-[14px]"
        variants={fadeUp}
      >
        {children}
      </motion.p>
    </motion.div>
  )
}
