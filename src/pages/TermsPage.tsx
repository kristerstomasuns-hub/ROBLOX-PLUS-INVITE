import { motion } from 'framer-motion'
import { PageIntro } from '../components/PageIntro'
import { TERMS_SECTIONS } from '../content'
import { useMotionPresets } from '../motion/tokens'

export function TermsPage() {
  const { fadeUp, staggerContainer } = useMotionPresets()

  return (
    <div className="shell pb-14 pt-10 sm:pt-14">
      <PageIntro eyebrow="terms" title="the short terms.">
        plain language, no tricks. by claiming a code you accept these.
      </PageIntro>

      <motion.div
        animate="visible"
        className="mt-8 flex flex-col gap-7"
        initial="hidden"
        variants={staggerContainer}
      >
        {TERMS_SECTIONS.map((section, index) => (
          <motion.section
            className="border-t border-line pt-5"
            key={section.title}
            variants={fadeUp}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="text-[14px] font-bold text-ink">
                {section.title}
              </h2>
            </div>
            <div className="mt-2 flex flex-col gap-2 pl-7">
              {section.body.map((paragraph) => (
                <p
                  className="text-[12px] leading-5 text-soft"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  )
}
