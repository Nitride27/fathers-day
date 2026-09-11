# BUWA Scroll Fix — Spec for Frontend Developer

**Status:** Proposed · **Date:** 2026-09-11 · **Author:** Software Architect
**Scope:** fix two user-reported scroll bugs without touching visual design or animation choreography.
**Constraint:** Architect writes spec only — all app-code edits belong to the Frontend Developer.

## 0. TL;DR

- **Bug 1 (fresh load lands on Hero): CONFIRMED.** The pinned intro creates a 3150 px
  `pin-spacer` with no snap point inside a `scroll-snap-type: y mandatory` scroller.
  Resting at offset 0 becomes invalid, so the snap engine yanks the scroller to the
  first snap point (Hero, offset 3150) as soon as layout settles. Reproduced with zero
  user input.
- **Bug 2 (no one-section-per-gesture): CONFIRMED same root cause.** Any wheel impulse
  while resting anywhere in the 3150 px pin range resolves to the Hero snap point;
  scrub and snap consume the same gesture and fight. Post-intro snapping itself works
  (800 px wheel → exactly +900 px, one section).
- **Fix direction PROVEN live:** with snap disabled, offset 0 holds (sealed envelope +
  `SCROLL TO UNFOLD` visible) and mid-pin offset 1000 holds (scrub reachable).
- **Fix contract:** keep the pin; make snap and pin mutually exclusive in time —
  `no-snap` on the scroller while the intro pin is active (`onToggle`/`isActive`),
  `mandatory` + `always` after it. Details + acceptance tests below.

## 1. Symptoms (user-reported)

1. Fresh load lands on Hero (`EXPLORE STORIES`) instead of the sealed paper-fold intro.
   Expected: first viewport = sealed envelope + `SCROLL TO UNFOLD`; Hero reachable only
   after scrolling through the unfold stages.
2. Scrolling does not advance exactly one full-viewport section per gesture.
   Expected: post-intro, each scroll lands one 100 dvh section, never mid-section.

## 2. Verdict on lead diagnosis: CONFIRMED (with one refinement)

The lead diagnosis is correct: **CSS `scroll-snap-type: y mandatory` on `.buwa-snap`
fights the pinned ScrollTrigger intro.** Evidence below. Refinement: the fresh-load
jump is not caused by a user scroll impulse — it fires on layout settle (pin-spacer
insertion + post-pin shifts from font/image loading), which is why it can look
nondeterministic across cold/warm cache (see §4, experiment A note).

## 3. Code under suspicion (file:line at time of writing)

| # | Location | Fact |
|---|----------|------|
| 1 | `app/globals.css:23-34` | `.buwa-snap { scroll-snap-type: y mandatory; overflow-y: auto; height: 100dvh; }` children `section` / `div[data-snap]` get `scroll-snap-align: start; scroll-snap-stop: always` |
| 2 | `app/page.tsx:18-26` | `.buwa-snap` div wraps `FoldedEnvelope` + 6 sections; it is the scroll container (window never scrolls: `body` height == viewport) |
| 3 | `components/intro/FoldedEnvelope.tsx:83-94` | Desktop: `trigger: root.current, scroller: getScroller(), start: "top top", end: "+=250%", scrub: 1, pin: true, anticipatePin: 1` |
| 4 | `components/intro/FoldedEnvelope.tsx:41-53` | Mobile (≤768 px): same pattern, `end: "+=150%"`, `pin: true` — mobile is pinned too, so mobile is affected too (contradicts `ARCHITECTURE.md` §3 "skip pin on mobile"; code wins) |
| 5 | `lib/gsapConfig.ts:25-28` | `getScroller()` returns the `.buwa-snap` **element** — correct, see §6 hard constraint |
| 6 | `components/sections/Hero.tsx:49-50` etc. | All 6 post-intro sections carry `data-snap` + inner `min-h-[100dvh]`; measured heights 900–905 px at 900 px viewport (all snap-compatible) |
| 7 | `app/layout.tsx:8` | Google Fonts loaded via runtime `<link>` (Fraunces/Inter/Caveat/Noto Devanagari) → FOUT layout shifts after pin setup; `FoldedEnvelope` has **no** `document.fonts.ready` / image-load `ScrollTrigger.refresh()` (only a refresh in the desktop cleanup, line 115) |
| 8 | `app/globals.css:5-7` | `html { scroll-behavior: smooth; }` applies to window scrolling, not the `.buwa-snap` div — harmless but useless; do not rely on it for in-page anchors |
| 9 | `components/ui/Nav.tsx:31-48`, `Hero.tsx:63-68` | In-page anchors (`#top #stories #letters #gallery #memories #about`) target elements inside the custom div scroller; browsers resolve them via nearest scrollable ancestor (works, verified) but as instant jumps that bypass pin stages |

## 4. Evidence (headless Chromium vs `next start` on :3005, viewport 1366×900)

Setup: production `next start -- --port 3005` (log `/tmp/buwa-3005.log`),
`playwright-core` + cached binary
`/home/nitride/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`. No app code changed.

**Experiment 1 — fresh load, no input** (cold cache, `networkidle` + 3.5 s):

- `scroller.scrollTop = 3150`, `scrollHeight = 8555`, `clientHeight = 900`.
- Direct children of `.buwa-snap`: `[0] DIV.pin-spacer (snap: none, h: 3150)`,
  then 6 `SECTION`s each `snap: start`, h ≈ 900.
- `.fold-hint` at top −88 (out of view); Hero `EXPLORE STORIES` CTA at top 611 (in view).
- `foldFinalOpacity = 1`, `twineOpacity = 0` → intro timeline already at end state.
- **Reads as:** fresh load rests at end-of-pin / Hero with zero user input. Bug 1 reproduced.

**Experiment 2 — scroll timeline sampled every 400 ms from navigation commit:**

- Samples 1–2: `scrollTop = 0`, `pin-spacer` absent.
- Sample 3 onward: `pin-spacer` present **and** `scrollTop = 3150` in the same sample.
- **Reads as:** the jump coincides exactly with pin-spacer insertion/layout settle.
  The spacer (3150 px = 900 + 250% × 900, matching desktop `end: "+=250%"`) has
  `scroll-snap-align: none`, so offset 0 no longer sits on a snap area and mandatory
  snap pulls forward to the first snap point — Hero at 3150.

**Experiment 3 — one 400 px wheel from offset 0, then one 800 px wheel:**

- After `scrollTo(0)` + single 400 px wheel → back at `3150`, Hero in view.
  Intermediate pin offsets are unreachable: any impulse in the pin range resolves to Hero.
- Second 800 px wheel → `4050` (exactly +900 = one section, Quote).
- **Reads as:** Bug 2 reproduced for the pin region; post-intro mandatory snap itself
  advances exactly one section. The pin range is the hole in the snap map.

**Experiment 4 — snap disabled live via `addStyleTag` (`snapNow: "none"`):**

- `scrollTo(0)` → holds at `0`, `.fold-hint` top 812 (visible, sealed intro in view).
- `scrollTo(1000)` (inside pin range) → holds at `1000`, timeline mid-state.
- **Reads as:** kill-experiment — snap is the antagonist; without it the pin works.

**Experiment 5 — branches:**

- `prefers-reduced-motion: reduce`: `scrollTop = 0`, snap `none` (existing
  `globals.css:92-99` media query ✓), static `fold-final.jpg` rendered, **no**
  pin-spacer. Reduced-motion branch is already correct — keep it.
- Anchor click `EXPLORE STORIES` (`href="#letters"`): `location.hash = #letters`,
  `window.scrollY` stays 0, scroller 3150 → 4050. Anchors move the div scroller via
  nearest-ancestor scrolling but jump instantly over pin stages (secondary issue, §5.6).
- `history.scrollRestoration` default `"auto"`, no hash on fresh load → scroll
  restoration is **killed** as a cause (fresh context, no history).
- Note: one fresh-load run with warm cache stayed at 0 (inline-style kill attempt
  showed `scrollTop: 0`, hint visible). Interpretation: the snap re-evaluation needs a
  post-pin layout shift (font FOUT / image decode) to fire — cold cache jumps,
  warm cache may not. This race is itself a symptom of the conflict, not a separate
  mechanism; the fix (mutual exclusion) removes the race.

**Ruled out:** scroll restoration, hash auto-scroll on load, JS programmatic scroll
(no `scrollTo` calls in app code), window-level scroll (body never scrolls).

## 5. Fix contract (normative — implement exactly this)

### 5.1 Intro pin config (keep, with additions)

- Keep `trigger: root.current` (element, never a string) and `scroller: getScroller()`
  (element, never the string `".buwa-snap"` — see §6).
- Keep `start: "top top"`, `end: "+=250%"` desktop / `"+=150%"` mobile, `scrub: 1`,
  `pin: true`, `anticipatePin: 1`.
- **Add** `onToggle(self)`: toggle the snap-kill class while the pin owns the scroll:
  `getScroller().classList.toggle("no-snap", self.isActive)`.
  Rationale: `isActive` is true for the whole pinned range (exactly the offsets with no
  snap points), false before/after — covers forward scroll, back-scroll (`onLeaveBack`
  path included), and resize/refresh recomputation with no extra handlers.
- **Add** `invalidateOnRefresh: true` on the intro ScrollTrigger and a
  `ScrollTrigger.refresh()` on `document.fonts.ready` (guard for browsers without the
  API) so FOUT shifts recompute pin distance instead of firing snap jumps.
- On timeline `onLeave` keep `dispatchComplete()`; ensure `onLeaveBack` does **not**
  un-fire it (current no-op is fine) but the `no-snap` toggle must re-engage when
  scrolling back into the pin (handled by `onToggle`, do not hand-roll with
  `onEnter/onLeave` only).

### 5.2 Snap strategy and pin/snap coexistence (the core fix)

- CSS: add `.buwa-snap.no-snap { scroll-snap-type: none; }`
  (put it **after** the `.buwa-snap` rule; same specificity, later wins — no `!important`).
- JS: the intro `onToggle` above adds `no-snap` at pin-activate and removes it at
  pin-release (both directions). While `no-snap` is present, wheel/touch scrub the
  unfold with no snap interference; once the pin releases at Hero, mandatory snap
  takes over for the section tour.
- Post-intro snap stays as-is: `y mandatory` + `align: start` + `stop: always`
  (this already delivers "exactly one 100 dvh section per gesture", verified +900/wheel).
  Do **not** downgrade to `proximity` — it permits mid-section rests and would regress
  Bug 2's acceptance test. (`ARCHITECTURE.md` §2 "prefer proximity" is superseded here;
  update that line when touching the doc.)
- Initial state: `no-snap` must be present from first paint until the pin activates
  (else the cold-cache fresh-load jump in §4 can fire before `onToggle` runs).
  Simplest: render the class in `page.tsx` markup (`className="buwa-snap no-snap"`) and
  let `onToggle` remove it on first pin-release. Reduced-motion never creates the pin,
  so also remove `no-snap` in the reduced-motion path (or rely on the existing
  `snap: none` media query — either way assert §7 test R1).
- Pin-spacer must never become a snap point: assert computed
  `scroll-snap-align: none` on `.pin-spacer` in tests (GSAP default; fail loudly if a
  global selector ever targets it).

### 5.3 Mobile 2D branch (≤768 px)

- Same coexistence mechanism: `end: "+=150%"` pin with `onToggle` → `no-snap`.
  (Mobile is pinned today; un-pinning mobile is an optional follow-up, not this fix.)
- Keep 2D fade/slide timeline (no perspective); keep `scrub: 1`.
- Touch: verified path is wheel in CI, but acceptance must include one touch-swipe run
  (Playwright `touchscreen.tap`/`swipe` or manual) asserting one-section steps post-intro.

### 5.4 Reduced-motion branch

- No change: static final panel, event fires immediately, no pin-spacer, snap `none`
  via media query. Acceptance R1–R2 (§7) locks this in.
- `useReducedMotion` defaults `false` pre-hydration (SSR-safe flash accepted per
  `ARCHITECTURE.md` §7); do not add blocking motion detection.

### 5.5 Section order guarantee

- DOM order is the scroll order: `FoldedEnvelope → Hero(#stories) → Quote(#letters) →
  MemoryWall(#gallery) → KusheAunsiBand(#about) → ShareMemory(#memories) → ThankYou`.
- No JS reordering, no `order` utilities, no conditional section rendering on scroll
  state. Nav link order must match section order.
- Pin-spacer wraps **only** the intro element; assert in tests that
  `.buwa-snap > *:nth-child(2)` is the Hero section and no other `.pin-spacer` exists.

### 5.6 Anchors / hash (secondary, include in this fix)

- In-page anchors must drive the **div scroller**, never `window`:
  intercept clicks on `a[href^="#"]` (Nav, Hero CTA, logo) → `scroller.querySelector(hash)?.scrollIntoView()`…
  but `scrollIntoView` under mandatory snap + active pin jumps over stages. Required
  behavior: if target is at/below Hero and the pin is still active, first animate the
  scroller through pin release (or temporarily set `no-snap`, jump, clear it), so Back
  and forward both pass through the unfold rather than teleporting past it.
- On load with a hash (e.g. shared `#letters` link): same path — resolve after pin
  setup, not via browser default (which races pin insertion). `history.scrollRestoration`
  stays default; do not add `scroll-behavior: smooth` to `.buwa-snap` (it fights scrub;
  snap animation already smooths post-intro steps).

### 5.7 Non-goals

- No visual/animation choreography changes (fold angles, timings, easing stay).
- No `scroller: ".buwa-snap"` string anywhere (see §6).
- No new dependencies. No `ScrollTrigger.config({ ignoreMobileResize })` changes unless
  a mobile test fails (then document as ADR).

## 6. HARD CONSTRAINTS (do not regress — CI must assert #1)

1. **`scroller` must ALWAYS be the `getScroller()` element, never the string
   `".buwa-snap"`.** Inside `gsap.context(fn, sectionRef)`, string selectors are
   re-scoped to that section's descendants — `.buwa-snap` is an ancestor, so the scoped
   lookup finds nothing and ScrollTrigger throws
   `Cannot read properties of undefined (reading '_gsap')`, blanking the whole page.
   This exact bug has bitten before. Same rule for `trigger`: pass elements/refs, not
   strings, for anything outside the section root. (String tweens like `.hero-line`
   inside their own section's context are fine — they ARE descendants.)
2. One `gsap.context` per animated component + `ctx.revert()` on cleanup (StrictMode).
3. Never create pin/scrub triggers when reduced-motion; never animate `width/filter/top`
   in the fold (compositor only).
4. `docs/scroll-fix-spec.md` (this file) is the contract; `ARCHITECTURE.md` §2
   pin+snap paragraph must be updated to match §5.2 when the fix lands (mandatory
   post-intro + `no-snap` during pin), not left contradicting it.

## 7. Acceptance tests (must all pass; run against `next start -- --port 3005`)

Harness: `playwright-core` (already a devDependency) + cached Chromium
`/home/nitride/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`
(no download). Fresh contexts (no scroll restoration), viewport 1366×900 unless noted.
Tolerances: offsets ±4 px (subpixel/scale), wait `networkidle` + 3 s settle (fonts).

- **F1 fresh-load viewport = envelope:** new context → `/` → assert
  `scroller.scrollTop < vh*0.5`, `.fold-hint` rect inside scroller viewport,
  Hero CTA rect below scroller viewport, `.pin-spacer` exists (desktop) with
  `scrollSnapAlign == "none"`, scroller has `no-snap` class. Fails today (scrollTop 3150).
- **F2 wheel advances through unfold, not past it:** `scrollTo(0)`, three 400 px wheels
  with 1.2 s settles → assert offsets strictly increasing, all `< pinEnd`
  (pinEnd = spacer height), `.fold-final` opacity goes 0 → 1 across the steps, and
  Hero CTA not yet in view after step 1. Fails today (step 1 already at 3150).
- **F3 post-intro one-section-per-gesture:** from pin end, three 800 px wheels →
  offsets `[pinEnd, pinEnd+vh, pinEnd+2vh]` ±4 px; assert never mid-section
  (`offset % vh < 4` or within 4 of a section top). Passes today — regression lock.
- **F4 back-scroll works:** from Quote top, `scrollTo(pinEnd - 300)` → assert pin
  re-engages (`no-snap` class present again), then `scrollTo(0)` → sealed state
  (`.fold-hint` visible, twine opacity back to start). Fails today (snap blocks re-entry).
- **F5 cold-cache reload:** clear cache (new browser, `--disk-cache-size=1` or fresh
  user-data-dir) → reload → same assertions as F1 (catches the FOUT-triggered jump).
- **M1 mobile 390×844** (`(max-width:768px)` branch): F1–F4 with `pinEnd` = 150% spacer;
  plus one touch swipe asserting a single-section step post-intro.
- **R1 reduced-motion:** `reducedMotion: "reduce"` → no `.pin-spacer`, snap `none`,
  static image alt `"Open letter of gratitude for Buwa"` visible at offset 0.
- **A1 anchors:** click `EXPLORE STORIES` from top → lands Quote top exactly (one snap
  point, no overshoot), Back returns through pin (not teleport); direct load of
  `/#letters` resolves after pin setup to Quote top.

## Appendix — environment notes for the implementer

- Background servers get reaped between sessions: start your own
  (`npm run start -- --port 3005` detached via `setsid`+`nohup`, or `next dev` on a
  unique port) and re-verify before finishing. Do not assume :3000 is yours.
- Server used for this spec's evidence is still running on :3005 (log
  `/tmp/buwa-3005.log`) but treat it as ephemeral.
- Do NOT commit (per task instruction); leave the spec + code changes uncommitted.
