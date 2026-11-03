import { motion } from 'framer-motion'
import { PageIntro } from '../components/PageIntro'
import { PROOF_TILES } from '../content'
import { useMotionPresets } from '../motion/tokens'

export function ProofPage() {
  const { blurReveal, fadeUp, staggerContainer } = useMotionPresets()

  return (
    <div className="shell pb-14 pt-10 sm:pt-14">
      <PageIntro eyebrow="proof" title="receipts, lightly redacted.">
        four screens from the dev side of the program. identifying details are
        kept out of frame.
      </PageIntro>

      <motion.div
        animate="visible"
        className="mt-8 flex flex-col gap-5"
        initial="hidden"
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROOF_TILES.map((tile) => (
            <motion.figure
              data-testid="proof-tile"
              key={tile.caption}
              variants={blurReveal}
            >
              <div className="aspect-video rounded-lg border border-line bg-[#eef1f4] p-3">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.14em] text-muted">
                    <span>captured</span>
                    <span>redacted</span>
                  </div>
                  <div className="my-auto flex flex-col gap-2.5 px-2">
                    <span className="redacted-line w-3/4" />
                    <span className="redacted-line w-1/2" />
                    <span className="redacted-line w-2/3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted">{tile.detail}</span>
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[8px] text-muted">
                      16:9
                    </span>
                  </div>
                </div>
              </div>
              <figcaption className="mt-2 text-[12px] text-muted">
                {tile.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <motion.p
          className="flex items-center gap-2 border-t border-line pt-4 text-[11px] text-muted"
          variants={fadeUp}
        >
          <span className="h-1 w-1 rounded-[1px] bg-accent" />
          identifying details blurred
        </motion.p>
      </motion.div>
    </div>
  )
}
