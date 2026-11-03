import { motion } from 'framer-motion'
import { PageIntro } from '../components/PageIntro'
import { useMotionPresets } from '../motion/tokens'

const STEPS = [
  {
    title: 'get the invite',
    body: 'Hit Get Invite on the home page. A short dialog asks for your Roblox username so the invite can be checked first.',
  },
  {
    title: 'confirm your account',
    body: 'Continue looks up your Roblox avatar and shows it back to you. If it is the wrong account, No returns to the username field.',
  },
  {
    title: 'verify and redeem',
    body: 'Choose Yes, wait through the short loading check, then press Verify you are a human. AdBlueMedia offers appear in the same dialog; open one, complete it, and continue to the invite. Apply it on Roblox. One month per claim, no card.',
  },
  {
    title: 'wait for the batch',
    body: 'Claims are applied in a 24-hour batch. The invite link is single use and stays tied to this browser.',
  },
] as const

export function CheckPage() {
  const { fadeUp, staggerContainer } = useMotionPresets()

  return (
    <div className="shell pb-14 pt-10 sm:pt-14">
      <PageIntro eyebrow="how it works" title="one button, one invite.">
        the home page hands you a single-use Roblox Plus invite. no form, no
        payment details.
      </PageIntro>

      <motion.div
        animate="visible"
        className="mt-8"
        initial="hidden"
        variants={staggerContainer}
      >
        {STEPS.map((step, index) => (
          <motion.section
            className="grid grid-cols-[28px_1fr] gap-3 border-t border-line py-5"
            key={step.title}
            variants={fadeUp}
          >
            <span className="pt-0.5 font-mono text-[10px] text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="text-[14px] font-bold text-ink">{step.title}</h2>
              <p className="mt-1.5 text-[12px] leading-5 text-soft">
                {step.body}
              </p>
            </div>
          </motion.section>
        ))}

        <motion.div
          className="mt-6 rounded-card border border-line bg-panel p-4"
          variants={fadeUp}
        >
          <p className="eyebrow">allocations</p>
          <p className="mt-2 text-[12px] leading-5 text-soft">
            allocation is per region, per day. a new batch lands at 09:00 UTC.
            if the invite does not apply, check that the account meets the Plus
            requirements before trying again.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
