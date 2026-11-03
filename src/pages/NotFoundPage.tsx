import { motion } from 'framer-motion'
import { PageIntro } from '../components/PageIntro'
import { useMotionPresets } from '../motion/tokens'

export function NotFoundPage() {
  const { fadeUp, staggerContainer } = useMotionPresets()

  return (
    <div className="shell pb-14 pt-10 sm:pt-14">
      <PageIntro eyebrow="404" title="this drop isn't here.">
        the link might be old, or the route moved. the footer links still work.
      </PageIntro>
      <motion.div
        animate="visible"
        className="mt-8 border-t border-line pt-5"
        initial="hidden"
        variants={staggerContainer}
      >
        <motion.p
          className="text-[12px] leading-5 text-soft"
          variants={fadeUp}
        >
          no code was issued on this page, and nothing was stored.
        </motion.p>
      </motion.div>
    </div>
  )
}
