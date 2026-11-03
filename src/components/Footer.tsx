import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMotionPresets } from '../motion/tokens'

const FOOTER_LINKS = [
  { to: '/check', label: 'How It Works' },
  { to: '/proof', label: 'Proof' },
  { to: '/faq', label: 'FAQ' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
] as const

export function Footer() {
  const { fadeUp } = useMotionPresets()

  return (
    <motion.footer
      animate="visible"
      className="border-t border-line bg-white"
      initial="hidden"
      variants={fadeUp}
    >
      <div className="plus-shell py-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] leading-5 text-soft">
              A 30-day Roblox Plus referral offer shared by a developer
              participating in the program.
            </p>
            <p className="text-[11px] leading-5 text-muted">
              This is an independent referral and is not affiliated with or
              endorsed by Roblox. Each eligible user may claim one 30-day trial.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted"
          >
            {FOOTER_LINKS.map((link) => (
              <Link className="footer-link" key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </motion.footer>
  )
}
