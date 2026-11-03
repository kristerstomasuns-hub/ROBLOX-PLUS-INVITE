import { motion } from 'framer-motion'
import { PageIntro } from '../components/PageIntro'
import { FAQ_ITEMS } from '../content'
import { useMotionPresets } from '../motion/tokens'

export function FaqPage() {
  const { fadeUp, staggerContainer } = useMotionPresets()

  return (
    <div className="shell pb-14 pt-10 sm:pt-14">
      <PageIntro eyebrow="faq" title="ask the dev.">
        the short answers, in the order people usually ask them.
      </PageIntro>

      <motion.div
        animate="visible"
        className="mt-8"
        initial="hidden"
        variants={staggerContainer}
      >
        {FAQ_ITEMS.map((item, index) => (
          <motion.section
            className="grid grid-cols-[28px_1fr] gap-3 border-t border-line py-5 last:border-b"
            key={item.question}
            variants={fadeUp}
          >
            <span className="pt-0.5 font-mono text-[10px] text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="text-[13px] font-bold leading-5 text-ink">
                {item.question}
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-soft">
                {item.answer}
              </p>
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  )
}
