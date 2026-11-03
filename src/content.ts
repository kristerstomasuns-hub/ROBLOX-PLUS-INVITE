export const PROOF_TILES = [
  {
    caption: 'dev dashboard',
    detail: 'allocation ledger',
  },
  {
    caption: '6-month credit',
    detail: 'program credit',
  },
  {
    caption: 'giveaway announcement',
    detail: 'community post',
  },
  {
    caption: 'dev profile',
    detail: 'program badge',
  },
] as const

export const PLUS_BENEFITS = [
  {
    title: 'Discounts on items, avatars, and more',
    description: '10% off for the first 60 days, then 20% off',
    icon: 'tag',
  },
  {
    title: 'Avatar backgrounds',
    description: 'Choose or create a background for your avatar',
    icon: 'image-person',
  },
  {
    title: 'App themes',
    description: 'Change the color of your platform background',
    icon: 'paint-brush',
  },
  {
    title: 'Profile frames',
    description: 'Customize your avatar with exclusive frames',
    icon: 'circle-dashed-person',
  },
  {
    title: 'Free private servers',
    description: 'Choose who you play with',
    icon: 'controller',
  },
  {
    title: 'Send Robux for free',
    description: 'Transfers may need parental approval',
    icon: 'robux',
  },
  {
    title: 'Trade and resell limited items',
    description: 'Build your collection of rare avatars',
    icon: 'hand-two-arrows-horizontal',
  },
  {
    title: 'Publish games and avatar items',
    description: 'Reach millions of players on Marketplace',
    icon: 'arrow-up-from-landscape-rectangle',
  },
] as const

export const FAQ_ITEMS = [
  {
    question: 'why only a month?',
    answer:
      'six months was the giveaway. devs get referral slices: one month per invite. i would hand out six if the program let me.',
  },
  {
    question: 'do i need a card?',
    answer:
      'no. the redeem link does not ask for payment details. if a page asking for a card shows up, close it.',
  },
  {
    question: 'why does it take 24 hours?',
    answer:
      'claims are batched by the program. your link gets applied on the next run, within 24 hours of claiming.',
  },
  {
    question: 'the allocation was gone when i looked',
    answer:
      'allocations are per region, per day. a new batch lands at 09:00 UTC — that is the time to try again.',
  },
  {
    question: 'are you roblox?',
    answer:
      "no. i'm a roblox dev in the Plus program handing out my referral allocation. not affiliated with Roblox.",
  },
  {
    question: 'my code expired',
    answer:
      'codes reissue automatically after 24 hours. nothing to do on your side — come back and grab the next one.',
  },
  {
    question: "the code didn't work — now what?",
    answer:
      'check the account age, region, and that it is not already subscribed. if it still fails, try the next allocation batch.',
  },
] as const

export const TERMS_SECTIONS = [
  {
    title: 'the deal',
    body: [
      'Roblox Plus Invite hands out 30 days of Roblox Plus through a Roblox Plus referral invite. one code per person, one month per account, while the allocation lasts.',
      'a code is single use. once it is applied to an account it cannot be moved or reused.',
    ],
  },
  {
    title: 'as-is',
    body: [
      'the code and the invite are provided as-is, with no warranty. i cannot promise a particular outcome once Roblox processes the claim.',
      'if the code does not apply, the fix is a reissue or a different check — not a payment.',
    ],
  },
  {
    title: 'not roblox',
    body: [
      'this is an independent developer drop. it is not affiliated with Roblox, and it is not a page run by Roblox.',
      'Roblox can change, pause, or end the Plus program at any time. that is outside my control.',
    ],
  },
  {
    title: 'caps and timing',
    body: [
      'allocation caps reset daily. the batch for your region can run out before the day is over.',
      'claims are applied in batches within 24 hours. issuing a code does not mean the subscription is active on the spot.',
    ],
  },
  {
    title: 'liability',
    body: [
      'to the extent the law allows, liability for this drop is zero. there is no charge, no card, and no account access involved.',
      'you keep full control of your Roblox account. never share a password or payment detail with anyone claiming to process a referral.',
    ],
  },
] as const

export const PRIVACY_SECTIONS = [
  {
    title: 'what is stored',
    body: [
      'the invite code is generated on your device and lives in your browser localStorage under pd_code.',
      'the username you type in the Get Invite dialog is sent to the verification endpoint and is not saved in localStorage. the avatar shown in the confirmation step is loaded from Roblox’s image CDN and is not stored here.',
      'clearing site data removes the invite code.',
    ],
  },
  {
    title: 'no accounts',
    body: [
      'there is no login, profile, or dashboard on this site. i ask for a Roblox username only to run the invite check, and never for your password.',
      'the username is not connected to a profile on this site.',
    ],
  },
  {
    title: 'offers',
    body: [
      'the verification step loads offers from AdBlueMedia. choosing an offer opens that provider’s page and leaves this site.',
      'AdBlueMedia may process your IP address and browser details to serve the offer and record completion. this site stores only the invite code in your browser.',
    ],
  },
  {
    title: 'views',
    body: [
      'the host may record aggregate page views, such as total visits to a route. that data is counted in aggregate and is not connected to an individual.',
      'there are no advertising pixels or cross-site profiles on this page.',
    ],
  },
] as const
