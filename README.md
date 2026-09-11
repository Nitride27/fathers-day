# BUWA. — A Father's Day scrollytelling site

Warm, editorial one-page site for Kushe Aunsi (Nepal's Father's Day).
Static export, hosted on GitHub Pages:
**https://nitride27.github.io/fathers-day/**

## Run locally

```bash
npm install
npm run build
npx serve out        # or any static server pointed at ./out
```

## Change pictures

Replace files in `public/images/` (keep the same filenames) and rebuild.
Originals live in `photos/`.

## Tech

Next.js 14 static export + Tailwind + GSAP/ScrollTrigger. No backend —
memories and postcards work fully in the browser (localStorage + canvas).
