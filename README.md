# Roblox Plus Invite

A single-page referral drop for 30 days of Roblox Plus. The page generates a single-use developer code, stores it as `pd_code`, and the blue **Get Invite** button opens a username dialog that checks the visitor. The final step shows a clean AdBlueMedia offers list in the same dialog, then continues to the matching Roblox redeem link. It deploys to Vercel with no manual configuration.

## Stack

- React 19 + TypeScript + Vite
- React Router for `/`, `/check`, `/proof`, `/faq`, `/terms`, `/privacy`
- Tailwind CSS for layout primitives and design tokens
- Framer Motion for the shared motion system
- Vitest + Testing Library for behaviour tests
- Vercel functions at `api/verify.ts` and `api/offers.ts`

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints. Node 20 or newer is required.

```bash
npm run typecheck   # TypeScript project build
npm test            # Vitest, one pass
npm run lint        # Oxlint
npm run build       # typecheck + production bundle
npm run preview     # serve the production bundle
```

Vite dev and preview both serve `/api/verify` and `/api/offers` through the same helpers used by the Vercel functions, so the avatar flow and offer feed work locally.

## Configuration

- `src/config.ts` — headline, subtitle, accent, batch progress, redeem URL.
- `src/content.ts` — Plus benefits, FAQ, terms, privacy, proof captions.

Environment variables:

| Name | Scope | Purpose |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | server | Comma-separated origins accepted by both API routes |
| `OFFER_FEED_URL` | server | AdBlueMedia feed endpoint |
| `OFFER_FEED_USER_ID` | server | AdBlueMedia account id |
| `OFFER_FEED_API_KEY` | server | AdBlueMedia feed key |

No secret is exposed to the browser.

## Invite link

`readOrCreateCode()` in `src/lib/storage.ts` creates one `DEV-XXXXXX` code per browser and stores it under `pd_code`. Clicking **Get Invite** opens a username dialog. **Continue** posts the trimmed username to `POST /api/verify`, which resolves the Roblox account and headshot. The dialog then shows the avatar and display name under “Is this you?”. The home page also shows a full-width batch progress bar that starts at **26/100 invite links claimed** for every visitor and adds one claim for that browser every 10 minutes, capped at 100. The base is `INVITE_ALLOCATION` in `src/config.ts`; the per-browser start is stored under `pd_claim_start_v2`.

**Not me** returns to the username field. **Yes** starts a short loading state inside the same dialog, then shows **Verify you're a human**. That button starts a second loading state and then shows the AdBlueMedia offers in the same dialog. Each **Start** button opens that offer in a new tab; **I've completed an offer — continue** then opens:

```text
https://www.roblox.com/plus/redeem?code=DEV-XXXXXX
```

Usernames must be 3–20 letters, numbers, or underscores. The username and avatar are not stored. Clearing site data creates a new code.

`POST /api/verify` accepts `{ "username": "..." }`, waits 1200 ms, resolves the public Roblox user and avatar endpoints, and returns:

```json
{
  "eligible": true,
  "region": "supported",
  "user": {
    "id": 1,
    "username": "Builderman",
    "displayName": "Builderman",
    "avatarUrl": "https://tr.rbxcdn.com/..."
  }
}
```

It returns a JSON error with status 400, 404, or 502 when the username is invalid, missing, or Roblox cannot be reached.

## Offers

`GET /api/offers?s1=DEV-XXXXXX` proxies the AdBlueMedia feed through `server/offers.ts`. The feed request uses the visitor IP, browser user agent, and the invite code as `s1`, and returns a normalized set of safe `https` offers:

```json
{
  "offers": [
    {
      "id": "70",
      "name": "Finance Survey",
      "description": "Complete the survey",
      "icon": "https://...",
      "url": "https://..."
    }
  ]
}
```

The offers dialog shows up to **five** AdBlueMedia offers, topping a thin geo result up from a wider feed and de-duplicating the list. It opens a selected offer in a new tab so the confirmation dialog stays put; if pop-ups are blocked it shows an inline message instead of redirecting the current tab. Completion tracking is intentionally disabled: clicked offer buttons keep their three-dot loaders, and the continue button always shows the five-second check followed by the “Please complete an offer before continuing.” warning. The server defaults to the official AdBlueMedia feed and public offers key; if `/api/offers` is unavailable or returns HTML, the dialog falls back to the same official feed over JSONP in the browser. Set `OFFER_FEED_URL`, `OFFER_FEED_USER_ID`, and `OFFER_FEED_API_KEY` for production. The private account key is never shipped to the browser.

## Motion system

`src/motion/tokens.ts` is the only motion token file. It defines the 140 ms / 240 ms / 420 ms durations, the two cubic-bezier curves, and the `fadeUp`, `fadeIn`, `scaleIn`, `staggerContainer`, `blurReveal`, page and dead-end variants. `useMotionPresets()` swaps every transform/filter variant for an opacity-only variant when the visitor prefers reduced motion.

Route transitions use `AnimatePresence` in `src/App.tsx`: 220 ms cross-fade plus 8 px on entry, 180 ms fade plus 6 px down on exit. The Plus benefit grid reveals with a 60 ms stagger on scroll.

## Brand assets

- `public/plus/` holds the Plus wireframe texture, the Roblox Plus glyph, and the eight benefit icons.
- `public/roblox-wordmark.svg` is the official Roblox wordmark used in the header, extracted from the supplied Roblox page.
- `public/favicon.ico`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` are generated from the rounded blue app icon.

## Deploy order

1. From the project root, run `npm ci` and `npm run build` to confirm the local production build.
2. Run `npx vercel` and link/create the project when prompted. Vercel detects Vite, runs `npm run build`, and deploys the two functions in `api/`.
3. Optional environment variables: `ALLOWED_ORIGINS` defaults to the production placeholder and `OFFER_FEED_*` defaults to the official AdBlueMedia feed and public offers key. Set them in **Project → Settings → Environment Variables** if you want your own values.
4. Verify the preview URL, then promote with `npx vercel --prod`.

`vercel.json` supplies the SPA rewrite, `cleanUrls`, `nosniff` and `Referrer-Policy` headers, and a 10-second cap for `/api/*`. `.vercelignore` keeps `node_modules`, `dist`, and local env files out of the upload. No private key is shipped to the browser.

## Tests

```bash
npm test
```

Coverage checks the Get Invite dialog, its username field and Cancel/Continue actions, inline username validation, the avatar confirmation step, the loading and human-verification stages, the 26/100 claim progress bar, the 10-minute per-browser increment, the AdBlueMedia offer list, generated-code persistence across remounts, the old claim-flow removal, and the logo home link.
