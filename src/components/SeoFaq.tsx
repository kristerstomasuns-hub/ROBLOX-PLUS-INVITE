const QUESTIONS = [
  {
    question: 'What is a Roblox Plus invite link?',
    answer:
      'A Roblox Plus invite is a referral link shared by a developer in the Roblox Plus program. This page offers a 30-day Roblox Plus invitation for eligible Roblox accounts.',
  },
  {
    question: 'How do I claim 30 days of Roblox Plus?',
    answer:
      'Select Get Invite, enter your Roblox username, confirm the account, verify you are human, and follow the offer steps. The Roblox Plus invite is applied to your Roblox account through the referral.',
  },
  {
    question: 'Is Roblox Plus free for 30 days?',
    answer:
      'Yes — this referral offers 30 days of Roblox Plus at no cost. No payment details are required here, and each eligible user may claim one invite.',
  },
  {
    question: 'Is this an official Roblox website?',
    answer:
      'No. This is an independent developer referral and is not affiliated with or endorsed by Roblox. Roblox and Roblox Plus are trademarks of Roblox Corporation.',
  },
] as const

export function SeoFaq() {
  return (
    <section
      aria-labelledby="invite-questions"
      className="plus-shell pb-14 pt-2"
    >
      <div className="border-t border-line pt-8">
        <h2
          className="text-[17px] font-semibold tracking-[-0.01em] text-ink"
          id="invite-questions"
        >
          Roblox Plus invite questions
        </h2>
        <p className="mt-2 max-w-[52ch] text-[12px] leading-5 text-soft">
          Quick answers about the 30-day Roblox Plus invite, referral link,
          trial eligibility, and redemption.
        </p>

        <div className="mt-4 divide-y divide-line/70 border-y border-line/70">
          {QUESTIONS.map((item) => (
            <details className="group py-3" key={item.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-left text-[13px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="text-[16px] font-normal leading-none text-muted"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[64ch] pb-2 pr-5 text-[12px] leading-5 text-soft">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
