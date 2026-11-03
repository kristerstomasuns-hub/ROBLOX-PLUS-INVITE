import { motion } from 'framer-motion'
import { PLUS_BENEFITS } from '../content'
import { useMotionPresets } from '../motion/tokens'

export function PlusBenefits() {
  const { fadeUp, staggerContainer } = useMotionPresets()

  return (
    <section aria-labelledby="plus-benefits-heading" className="plus-shell mt-12">
      <motion.div
        initial="hidden"
        variants={staggerContainer}
        viewport={{ amount: 0.15, once: true }}
        whileInView="visible"
      >
        <motion.div className="flex flex-col gap-1" variants={fadeUp}>
          <h2
            className="text-[18px] font-bold tracking-[-0.02em] text-ink"
            id="plus-benefits-heading"
          >
            Why join Plus?
          </h2>
          <p className="text-[12px] leading-5 text-soft">
            Everything in Plus is included for your 30 days.
          </p>
        </motion.div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLUS_BENEFITS.map((benefit) => (
            <motion.div
              className="flex items-start gap-3 rounded-card border border-line bg-panel p-4"
              key={benefit.title}
              variants={fadeUp}
            >
              <img
                alt=""
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
                src={`/plus/${benefit.icon}.svg`}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-5 text-ink">
                  {benefit.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-5 text-soft">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
