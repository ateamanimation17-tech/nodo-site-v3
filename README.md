# NODO — Marketing Site & Blog

Next.js (App Router) + Tailwind CSS. Fonts are self-hosted via `@fontsource` (Fraunces, Manrope, JetBrains Mono) — no external font requests at runtime.

## Run locally

```
npm install
npm run dev
```

Then open http://localhost:3000

## Structure

- `src/app/page.tsx` — landing page
- `src/app/pricing/page.tsx` — pricing + FAQ
- `src/app/blog/` — journal index + posts (content lives in `src/lib/posts.ts`)
- `src/app/signup`, `src/app/login` — auth UI (not yet wired to a backend — see project notes)
- `src/components/` — Nav, Footer, Logo, TabMockup

## Status

This is the design + content pass. Not yet wired: Supabase auth, Stripe subscription checkout/webhooks, and the gated member area embedding the NODO Reset OS app with cross-device sync. See the separate deploy guide for the account setup needed before that wiring can happen.
