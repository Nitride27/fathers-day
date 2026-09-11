# BUWA — Architecture & Integration Plan (v1)

Stack: Next.js 14 App Router + TS + Tailwind + GSAP/ScrollTrigger (CSS-3D fold, no Three.js) + Howler.js, hosted on Vercel.
Source reviewed: `fathersdaymockup.png` (only file in dir at time of writing). No starter code existed to validate — tree below is normative.

## 1. Mockup details the spec misses

Palette: paper `#F3EEE4`, ink `#2A2622`, ritual red `#8C1D18` confirmed. Add: sunset gradient (burnt-orange → deep maroon) in ThankYou, warm photo tint, sage/temple-stone in side polaroids. Paper grain over everything.
Typography system (3 families, spec only says "tall serif + grotesk + script"):
- Display: tall condensed Didone/serif, uppercase, tight leading (HERO, KUSHE AUNSI, THANK YOU BUWA).
- Micro-eyebrow: grotesk uppercase, tracking ~0.2em, 10–11px (`KUSHE AUNSI • 2083`, `THEIR IMPACT`, `MEMORY WALL —`, `SMALL MOMENTS. BIG LESSONS.`).
- Script/hand: red + ink handwritten for annotations (`Not just a father…`, `Dear Buwa…`, `बुवा, तपाई नै हाम्रो शक्ति!`, `Different paths. Same love.`, `A lifetime of love, folded in moments.`).
Recurring pattern spec misses: eyebrow + short red dash rule; hairline dividers (dotted top rule above Quote/MemoryWall); caption = italic script + red underline flourish (6 MemoryWall labels); CTA = solid red pill/rect `EXPLORE STORIES →`.
Ephemera layer (do not skip — carries the concept): tape corners on polaroids, twine + wax/flower on envelope, pressed-flower stems, sticky note with Devanagari + heart, postage stamp + mandala watermark on postcard, mountain line-doodle repeated 4× (quote, fold-stage-3, postcard, thank-you), prayer flags over pagoda, father-child silhouette in ThankYou, vertical `KUSHE AUNSI 2083` stamp at ThankYou right edge.
Layout: Hero is asymmetric — ~40% type left, ~60% overlapping tilted collage right (main + 3 small). Quote is 2-col (large serif left, vertical rule + grotesk + script + mountain SVG right). KusheAunsiBand is 3-col on dark (text | Ken Burns pagoda | 4 red-line-icon rows). ShareMemory is 2-col (steps left, postcard + flower + mandala right). ThankYou is full-bleed with type left, silhouette right. Footer cropped in mockup — keep minimal (logo, micro-nav, credit line).

## 2. Component boundaries & state flow

```
app/layout.tsx (fonts, metadata, grain + music shell only — no Nav)
app/page.tsx (owns: introComplete, memories[]; renders Nav + all sections in order)
├── ui/Nav.tsx (props: visible:boolean; hidden until introComplete)
├── intro/FoldedEnvelope.tsx (props: onComplete:()=>void; emits buwa:intro-complete)
├── sections/Hero|Quote|MemoryWall|KusheAunsiBand|ShareMemory|ThankYou.tsx
├── ui/WriteMemoryModal.tsx (controlled by ShareMemory, onAdd(memory))
├── ui/PaperGrainOverlay.tsx + ui/MusicToggle.tsx (no props, self-contained)
lib/gsapConfig.ts (singleton gsap.registerPlugin) · hooks/useReducedMotion.ts · lib/memories.ts (type + seed data)
```

State decisions:
- `introComplete`: lifted `useState` in `page.tsx` is source of truth; `buwa:intro-complete` CustomEvent is a secondary notification (music unlock, analytics), not the UI driver. Rationale: testable/SSR-safe/StrictMode-safe; event alone is untyped and hard to test. Nav lives in `page.tsx`, not `layout.tsx`, so no cross-layout sync needed.
- `memories`: lifted to `page.tsx` (`const [memories,setMemories]=useState(seed)`), passed down to `MemoryWall memories` (pure grid) and `ShareMemory onAdd`. No Context needed for 2 consumers / 1-level drill. Front-end only: prepend + optional `localStorage` (deferred).
- Modal: `ShareMemory` owns `open:boolean`; `WriteMemoryModal` is controlled (`open,onClose,onSubmit`), traps focus, returns `{name,message,image?}` — no image upload in v1 (preview via object URL only).
- Music: `MusicToggle` self-contained (Howler loop, `unlockOnGesture`), listens for intro-complete only to enable fade-in, never drives layout.

GSAP pattern (every animated component):
```ts
const scope = useRef<HTMLDiv siegeElement>(null);
useLayoutEffect(()=>{
  const ctx = gsap.context(()=>{ /* triggers scoped to scope.current */ }, scope);
  const onLoad = ()=>ScrollTrigger.refresh();
  window.addEventListener('load', onLoad);
  return ()=>{ window.removeEventListener('load',onLoad); ctx.revert(); };
},[reducedMotion]);
```
Rules: one `gsap.context` per section, selectors scoped, `ctx.revert()` mandatory (StrictMode), `ScrollTrigger.refresh()` after fonts/images, `matchMedia` inside GSAP for desktop/mobile split, never create triggers when `reducedMotion`.

Pin + snap handoff: CSS `scroll-snap-type: mandatory` on any ancestor of a `pin:true` trigger causes stuck/jitter (pin hijacks scroll, snap fights back). Rule: NO mandatory snap on the pinned intro ancestor. Use `proximity` only on post-intro sections, or toggle `snap-none` on `<html>` while intro is pinned and restore on `introComplete`. Prefer ScrollTrigger `snap` over CSS snap if snap is required.

## 3. Performance plan

- Images: `next/image`, AVIF-first + WebP fallback, `sizes` per breakpoint, `placeholder="blur"` (LQIP) for above-fold, `loading="lazy"` + `decoding="async"` below fold. Preload ONLY fold stage-1/4 LCP images (`<link rel="preload" as="image">`); everything else lazy. Lazy-mount below-fold sections with `next/dynamic` (ssr:true) or IntersectionObserver gate for Quote and below.
- Fold panels: 4 fixed-aspect panels, `transform-style:preserve-3d`, animate `rotateX/rotateY + transform-origin` (compositor only). Never animate `width/filter/top`.
- `will-change`: add `will-change:transform` via `onToggle(self.isActive)` only while trigger active; clear on `onLeaveBack/onComplete`.
- Ken Burns (pagoda) + Hero parallax + ThankYou mouse parallax: transform/opacity only, `force3D:true`, max 1 continuously-animating layer on mobile (`prefers-reduced-motion` or `pointer:coarse` → static frame). ThankYou mouse parallax disabled on touch.
- Mobile Safari: `matchMedia('(max-width:768px), (pointer:coarse)')` → skip pin + 3D fold, render 2D crossfade/stacked stages; `normalizeScroll:false` on iOS; test `end:+=250%` collapses to natural height.
- Fonts: `next/font` with `display:swap`, subset Devanagari separately so Latin LCP isn't blocked.
- Audio: Howler mp3 preload `none` until first gesture; single loop instance.

## 4. Accessibility plan

- `useReducedMotion()` (`matchMedia('(prefers-reduced-motion: reduce)')`): FoldedEnvelope renders static final mountain panel; all scrub reveals render end-state; Ken Burns/parallax off; `buwa:intro-complete` fires immediately so Nav appears.
- Skip-intro button (visible, focusable, first in tab order over intro) → sets `introComplete` + scrolls to Hero.
- Modal: focus trap + `Esc` close + return focus to trigger + `role="dialog" aria-modal` + labelled inputs.
- Alt text: meaningful for all 6 MemoryWall + hero father-child (`alt` describes relation/action, not "image1"); decorative ephemera (tape, doodles, grain, mandala) `aria-hidden` / empty alt.
- Contrast: cream-on-photo and script-over-photo get scrim (`bg-black/35` + `text-shadow`) to hold 4.5:1; red-on-cream `#8C1D18` passes for large text, verify small eyebrows; ThankYou cream-on-sunset verified at smallest size; focus-visible rings everywhere.

## 5. File tree (final) + build sequence

```
app/layout.tsx app/page.tsx app/globals.css
lib/gsapConfig.ts lib/memories.ts hooks/useReducedMotion.ts
components/intro/FoldedEnvelope.tsx
components/sections/{Hero,Quote,MemoryWall,KusheAunsiBand,ShareMemory,ThankYou}.tsx
components/ui/{Nav,WriteMemoryModal,PaperGrainOverlay,MusicToggle}.tsx
public/{images/*, audio/loop.mp3, fonts/}
```

Build order: (1) tokens in `globals.css` (palette/type/scale/grain) → (2) static layout + section shells, no animation, verify snap-proximity doesn't trap → (3) Nav + MusicToggle shell + `introComplete` wiring → (4) FoldedEnvelope in isolation (`pin,end:+=250%,scrub:0.6`) → (5) section animations easiest→hardest: ThankYou → MemoryWall (`back.out(1.4)`) → Hero parallax → Quote word-scrub + SVG line-draw → KusheAunsiBand (Ken Burns + Devanagari blur-to-sharp) → ShareMemory modal → (6) audio unlock → (7) responsive (mobile 2D fallback) → (8) perf (images, will-change, lazy-mount) → (9) QA on trackpad/wheel/touch + reduced-motion + slow-3G.

## 6. Open decisions

1. Fonts: Fraunces (OFL, free) for display + Inter/System grotesk + Caveat (OFL) for script + Noto Serif Devanagari (OFL) — RECOMMEND, avoids Canela commercial license. Load Devanagari as separate subset.
2. CMS: none for v1 (seed data in `lib/memories.ts`). RECOMMEND Next step: Sanity/Contentful only when persistence is requested.
3. Torn-edge / deckle SVG masks: DEFER — use `border-radius:2px + rotate + shadow` for v1; real masks add clip-path cost on mobile.
4. Persistence for Write Memory: DEFER — front-end state only; `localStorage` optional, DB (Vercel KV/Prisma) is Backend phase 2.
5. Three.js: REJECT for v1 — CSS-3D fold meets mockup; revisit only if fold depth fails review.

## 7. Risks + mitigations

- GSAP pin + CSS snap conflict → stuck scroll. Mitigate: no mandatory snap on pinned ancestor; toggle class during pin; verify with wheel + trackpad + touch.
- Mobile 3D fold perf (low-end Android/iOS) → jank/thermal. Mitigate: 2D crossfade fallback via `matchMedia`; cap DPR-sensitive layers; one compositor layer at a time.
- Image weight (10+ photos + pagoda + sunset) → slow LCP. Mitigate: AVIF/WebP, sizes, LQIP, preload only fold LCP, lazy-mount below fold, audit with Lighthouse slow-4G.
- Howler autoplay block → silent toggle. Mitigate: `preload:none`, unlock on first gesture/intro-complete, visible toggle state.
- Devanagari font FOUT + line-draw SVG timing → layout shift. Mitigate: font subset + `size-adjust`, `ScrollTrigger.refresh()` on `document.fonts.ready`.
- Hydration mismatch (reduced-motion/intro state SSR vs client) → flash. Mitigate: default SSR to intro-incomplete + static-safe markup; resolve motion only in `useLayoutEffect`.
