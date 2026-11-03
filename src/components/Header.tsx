import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMotionPresets } from '../motion/tokens'

export function Header() {
  const { fadeUp } = useMotionPresets()

  return (
    <motion.header
      animate="visible"
      className="sticky top-0 z-40 border-b border-line bg-white"
      initial="hidden"
      variants={fadeUp}
    >
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4">
        <Link
          aria-label="Roblox Plus Invite home"
          className="flex shrink-0 items-center transition-opacity duration-[140ms] ease-[cubic-bezier(.22,1,.36,1)] hover:opacity-75"
          onClick={() => window.scrollTo(0, 0)}
          to="/"
        >
          <img
            alt="Roblox"
            className="h-7 w-auto object-contain"
            draggable={false}
            height={28}
            src="/roblox-wordmark.svg"
            width={149}
          />
        </Link>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
          <span className="h-1 w-1 rounded-full bg-accent" />
          dev referral
        </span>
      </div>
    </motion.header>
  )
}
