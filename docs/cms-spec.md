# BUWA Site-Content CMS — Spec (v1)

Owner-facing goal: **no-code control of every image on the site.** Open `/admin`,
pick a section → pick a slot → see the current photo → upload a replacement →
edit its attached text (only where text exists) → save → live. No code, no
rebuild, no guessing where images live.

Scope of this doc: **spec only.** A Backend agent builds the store/API, a
Frontend agent builds `/admin` + component wiring. This doc is their shared
contract. No app-code changes are made here.

## 0. Where images live today (owner confusion, answered)

| What | Where | Who touches it |
|---|---|---|
| Default site photos (17 files) | `public/images/*.jpg`, referenced by hard-coded `src="…"` strings inside section components | Nobody (after this CMS, never by hand) |
| Owner-uploaded photos | `public/uploads/*` via existing `POST /api/upload` (same-origin URLs, accepted by the memories schema) | Owner, through `/admin` |
| Owner overrides (which slot → which src + text) | NEW: `.data/site-content.json` (JSON file store, same pattern as `.data/memories.json`) | Owner, through `/admin` (never by hand) |
| User-submitted memory photos | `public/uploads/*` + `.data/memories.json` (existing flow, unrelated to this CMS) | Visitors, through ShareMemory form |

Rule after v1: **components never hard-code a final `src` again** — they render
`resolve(slotId).src`, which falls back to the compiled default when no
override exists (§6). The hard-coded strings move into exactly one place: the
defaults table in `lib/slots.ts` (§2).

## 1. Slot registry (19 entries: 17 image + 2 text-only)

`id` is stable and semantic (`section.slot`); Frontend and Backend MUST both
import it from `lib/slots.ts` — never re-type it. `label` is the exact string
`/admin` shows the owner. `source: canva` marks the three Canva photos.
`text` lists editable text attached to the slot; `— none (alt only)` means the
slot has no caption/note and `/admin` shows no text inputs for it (beyond `alt`).

`fallback` is the Tailwind gradient already behind each `<img>` — it stays as
the loading/`onError` fallback. **There are no empty gradient placeholder
slots**: every slot ships with a real default photo; gradients are fallbacks
only, not slots.

### Intro fold (`components/intro/FoldedEnvelope.tsx`)

| id | label | default src | text | notes |
|---|---|---|---|---|
| `fold.panel-a` | Intro fold — left flap photo | `/images/fold-panel-a.jpg` | — none (alt only) | Decorative (`aria-hidden`, `alt=""`) |
| `fold.panel-b` | Intro fold — right flap photo | `/images/fold-panel-b.jpg` | — none (alt only) | Decorative (`aria-hidden`, `alt=""`) |
| `fold.final` | Intro fold — final reveal letter | `/images/fold-final.jpg` | `caption`, `alt` | Caption unifies two copies that exist today: desktop shows “Same mountains, new dreams. Thank you, Buwa.”, reduced-motion shows “A lifetime of love, folded in moments.” → single `caption` field, default `Same mountains, new dreams. Thank you, Buwa.`; both render paths MUST read it (§7.3) |

### Hero (`components/sections/Hero.tsx`)

| id | label | default src | text | notes |
|---|---|---|---|---|
| `hero.main` | Hero — main portrait (large tilted frame) | `/images/hero-main.jpg` | — none (alt only) | Meaningful alt: “Father carrying his laughing child on shoulders, Himalayas behind” |
| `hero.village` | Hero — village walk (small, right) | `/images/hero-village.jpg` | — none (alt only) | |
| `hero.pagoda` | Hero — pagoda flags (small, lower right) | `/images/hero-pagoda.jpg` | — none (alt only) | |
| `hero.mountains` | Hero — mountain panorama (bottom left) | `/images/hero-mountains.jpg` | — none (alt only) | **Canva photo** (panorama) |
| `hero.eyebrow` | Hero — eyebrow line (TEXT ONLY, no photo) | — | `text.eyebrow` | Default `KUSHE AUNSI • 2083`. Kind `text`, not `image`; `/admin` lists it under Hero with a text input and no uploader |

### Quote (`components/sections/Quote.tsx`)

**Zero image slots.** Text + inline mountain SVG doodle only. `/admin` shows the
section header with the note “No photos in this section” so the owner doesn't
go hunting for one.

### Memory wall (`components/sections/MemoryWall.tsx`, static `MEMORIES` array)

| id | label | default src | text |
|---|---|---|---|
| `memory.first-day` | Memory wall — card 1 | `/images/memory-first-day.jpg` | `caption` (`First school day`), `alt` |
| `memory.honesty` | Memory wall — card 2 | `/images/memory-honesty.jpg` | `caption` (`Learning honesty`), `alt` |
| `memory.trips` | Memory wall — card 3 | `/images/memory-trips.jpg` | `caption` (`Family trips`), `alt` |
| `memory.festivals` | Memory wall — card 4 | `/images/memory-festivals.jpg` | `caption` (`Festivals`), `alt` |
| `memory.hard-work` | Memory wall — card 5 | `/images/memory-hard-work.jpg` | `caption` (`Hard work`), `alt` |
| `memory.simple-joys` | Memory wall — card 6 | `/images/memory-simple-joys.jpg` | `caption` (`Simple joys`), `alt` |

Caption renders as `<figcaption>` AND `alt` today (`alt={m.caption}`); the
override keeps both fields but `/admin` offers “same as caption” as the
default alt behavior (§3).

### Kushe Aunsi band (`components/sections/KusheAunsiBand.tsx`)

| id | label | default src | text | notes |
|---|---|---|---|---|
| `kushe.pagoda` | Tradition — pagoda at sunset (Ken Burns) | `/images/kushe-aunsi-pagoda-sunset.jpg` | — none (alt only) | **Canva photo**. Any aspect works; container is `aspect-[4/3]` with `object-cover` |

### Share memory (`components/sections/ShareMemory.tsx`)

| id | label | default src | text | notes |
|---|---|---|---|---|
| `share.postcard-photo` | Share — postcard photo (left card) | `/images/share-memory-postcard.jpg` | — none (alt only) | Square crop (`aspect-square`, `object-cover`) |
| `share.flower` | Share — pressed flower mini frame (right) | `/images/share-memory-flower.jpg` | `caption`, `alt` | **Canva photo** (marigolds). Caption default `for Buwa ♥`; portrait crop (`aspect-[3/4]`) |
| `share.postcard-note` | Share — postcard note card (TEXT ONLY, no photo) | — | `text.body`, `text.signature` | Defaults: body `Dear Buwa,\nThank you for every sacrifice, every lesson, and every silent act of love.`, signature `— Samridha.` Kind `text` |

### Thank you (`components/sections/ThankYou.tsx`)

| id | label | default src | text | notes |
|---|---|---|---|---|
| `thankyou.sunset` | Finale — full-bleed sunset background | `/images/thank-you-sunset.jpg` | — none (alt only) | Background layer (`aria-hidden`, `alt=""`); gradient `from-[#7A1E12] via-[#B23A1D] to-[#2A0F0C]` + scrim stay underneath as fallback |

**Registry size: 19 slots (17 image + 2 text-only). 11 of 17 image slots carry
no attached text; 6 carry a caption (`fold.final`, 6× `memory.*`… i.e.
`fold.final`, `share.flower`, and the six memory cards); every image slot
carries an editable `alt`.**

## 2. Registry schema (`lib/slots.ts` — single source of truth)

Backend AND Frontend import from here. Adding a future section = appending one
entry; no API or admin structural change.

```ts
export type SlotKind = "image" | "text";

export interface ImageSlotDef {
  id: string;            // e.g. "memory.first-day" — stable, never renamed
  kind: "image";
  section: "Intro fold" | "Hero" | "Memory wall" | "Tradition" | "Share" | "Finale";
  label: string;         // owner-facing, exact string from §1 tables
  defaultSrc: string;    // e.g. "/images/hero-main.jpg"
  source: "canva" | "site";   // canva = one of the 3 Canva photos
  fallbackGradient: string;   // existing bg-gradient classes, kept as-is
  defaultAlt: string;
  defaultCaption?: string;    // present ⟺ slot has editable caption
  aspectNote?: string;        // e.g. "aspect-[3/4], object-cover"
}

export interface TextSlotDef {
  id: string;            // "hero.eyebrow" | "share.postcard-note"
  kind: "text";
  section: string;
  label: string;
  fields: Record<string, string>;  // default values, e.g. { body, signature }
}

export type SlotDef = ImageSlotDef | TextSlotDef;
export const SLOTS: SlotDef[] = [ /* §1, in page order */ ];
export const SLOT_IDS = new Set(SLOTS.map((s) => s.id));
```

## 3. Override schema (what the owner actually changes)

Stored per slot id; **partial** — only changed fields are stored, everything
else falls back to `SLOTS` defaults (§6), so old overrides never break when
defaults evolve.

```ts
export interface SlotOverride {
  src?: string;                  // /uploads/*.jpg|png|webp (from POST /api/upload) or https://… (Blob later)
  alt?: string;                  // max 180 chars
  caption?: string;              // max 120 chars; only for slots with defaultCaption
  text?: Record<string, string>; // only for kind:"text" slots; each value max 500 chars
}

export interface SiteContentFile {
  version: 1;
  updatedAt: string;             // ISO timestamp, set on every write
  overrides: Record<string, SlotOverride>;  // key = slot id; absent key = no override
}
```

Validation rules (zod, mirroring `app/api/memories/route.ts` conventions):
`src` must match `https://…` or `/uploads/…` (same allowlist shape as the
memories `photoUrl` field); unknown slot ids rejected; `caption`/`text` on a
slot that has none rejected (`NO_TEXT_FIELD`); empty-string values un-set the
field (fall back to default) rather than storing blanks. Memory-card `alt`
defaults to its caption unless the owner writes a custom alt.

## 4. API contract

### `GET /api/content` — merged defaults + overrides (public, read)

```jsonc
{ "ok": true, "data": {
    "updatedAt": "2026-09-11T00:00:00.000Z",
    "slots": [
      { "id": "memory.first-day", "kind": "image", "src": "/uploads/abc.jpg",
        "alt": "First school day", "caption": "First school day", "hasOverride": true },
      { "id": "hero.main", "kind": "image", "src": "/images/hero-main.jpg",
        "alt": "Father carrying his laughing child on shoulders, Himalayas behind", "hasOverride": false }
      // …all 19 slots, page order; text slots: { "id": "share.postcard-note", "kind": "text", "text": { "body": "…", "signature": "…" } }
    ]
} }
```

Merge rule: `merged = { …defaults, …override }` per slot; `hasOverride`
drives the `/admin` “customized / default” badge and the reset button.

### `POST /api/content` — upsert overrides (admin write, §8)

Request (single-slot; batch = array of the same shape):

```jsonc
{ "id": "share.flower", "override": { "src": "/uploads/xyz.webp", "caption": "for Buwa ♥" } }
```

Response: `{ "ok": true, "data": <merged slot> }` (same shape as one `GET`
entry). Errors reuse existing conventions: `INVALID_BODY` (400, zod issues),
`UNKNOWN_SLOT` (400), `NO_TEXT_FIELD` (400), `RATE_LIMITED` (429, same
in-process limiter pattern as memories — `// ponytail:` comment marking the
Upstash KV swap point).

### `DELETE /api/content?id=<slotId>` — reset one slot to default

Deletes the override key (photo reverts to `defaultSrc`, text to defaults).
Returns the merged (now default) slot. This is the “Reset to original” button.

### Reuse, do not rebuild: `POST /api/upload`

`/admin` uploads files through the **existing** `POST /api/upload`
(multipart `file`; JPEG/PNG/WebP ≤ 5 MB; returns `{ ok, data: { url } }`) and
then writes the returned URL via `POST /api/content`. No new upload endpoint,
no changed limits — owner photos and visitor memory photos share one pipeline.

## 5. Persistence

New `lib/site-content.ts` mirroring `lib/memories.ts` exactly: in-memory
cache + `load()` (read `.data/site-content.json`, fall back to
`{ version: 1, overrides: {} }` on missing/corrupt file) + `save()` (mkdir
+ atomic write). File: **`.data/site-content.json`**.

Caveats (copy the existing pattern, including its comments):
- **Vercel filesystem is ephemeral** — `.data/*.json` AND `public/uploads/*`
  both reset on redeploy/scale. `lib/memories.ts` already documents this
  (`BLOB_READ_WRITE_TOKEN` → Vercel Blob/KV). **Swap points (only these two
  files change when persistence is upgraded):** `lib/site-content.ts`
  (`load`/`save`) and `app/api/upload/route.ts` (write target + returned URL
  becomes the Blob URL — already accepted by the `https://` branch of the src
  validation, so the API contract and `/admin` do not change).
- Corrupt JSON MUST NOT break the public site: on parse failure log + serve
  empty overrides (defaults render). Same resilience rule as `load()` in
  `lib/memories.ts`.

## 6. Client-side override resolution (site never breaks)

New `hooks/useSiteContent.ts`:

- On mount, `fetch("/api/content", { cache: "no-store" })`; until it resolves
  (or if it fails), every slot renders its compiled default from `SLOTS`.
  Fallback is synchronous and unconditional — **a failed/empty CMS response is
  visually identical to today's site.**
- Exposes `resolve(id)` → merged `{ src, alt, caption?, text? }` and
  `ready: boolean`. Components call it per slot; no prop drilling (4+ consumer
  sections, 2-level depth — same justification scale that kept `memories` state
  lifted in `ARCHITECTURE.md §2`, but here a hook avoids rewiring `page.tsx`).
- Images keep their existing `onError → hide` handlers and gradient
  backgrounds, so a deleted/expired upload degrades to gradient, never a broken
  icon.
- Uploads render with the same `<img>` + `object-cover` + container aspect
  classes already in place, so owner photos of any dimensions slot in without
  layout work. No `next/image` migration in v1 (components use `<img>` today;
  changing that is out of scope).

## 7. Static-array + caption interaction (exact wiring)

1. **MemoryWall `MEMORIES` becomes defaults, not content.** Keep the array
   (it holds layout data: `rotate`, `gradient`) but reduce it to
   `{ slotId, rotate, gradient }` and read `src`/`caption`/`alt` from
   `resolve(slotId)`. Caption edit → `POST /api/content`
   `{ id, override: { caption } }` → hook state updates → `<figcaption>`
   re-renders. No array edit, no redeploy.
2. **Hero / Kushe / Share / ThankYou / Fold** replace each literal
   `src="/images/…"` with `resolve("<id>").src` (same `alt` pattern). No
   other markup changes; GSAP selectors and class names are untouched.
3. **`fold.final` caption unification (breaking-copy note):** two hard-coded
   strings exist today (desktop vs reduced-motion, §1). Both MUST render
   `resolve("fold.final").caption`. Default value preserves current desktop
   copy; the reduced-motion variant is retired (documented here so QA knows the
   reduced-motion caption text intentionally changes).
4. **Text slots** (`hero.eyebrow`, `share.postcard-note`) render
   `resolve(id).text.*` with defaults as fallback — same hook, no special case.
5. Keying: MemoryWall keeps `key={slotId}` (stable across src swaps, so React
   reuses DOM nodes and GSAP `.memory-card` triggers don't re-fire on override
   updates).

## 8. Admin auth stance for the local demo: OPEN with a written warning

`/admin` ships with **no login** for the local demo, behind a persistent,
non-dismissible banner: “Demo mode — anyone with this URL can change site
photos. Set ADMIN_TOKEN before sharing or deploying.” A shared-token gate was
rejected for v1 because it forces a login screen, secret distribution, and
session handling onto the parallel Frontend build for a demo whose threat
model is “localhost + screen-share,” while an open page keeps the entire
Backend+Frontend contract to the three endpoints in §4; the documented upgrade
is a single env check (`ADMIN_TOKEN` compared against a bearer header in
`POST`/`DELETE /api/content`, public `GET` unchanged), so closing the hole
later touches one file, not the UI.

## 9. No-code workflow (exact)

1. Owner opens `/admin` (link from `RUN.md`; not linked in public nav).
2. Picks a **section** (Intro fold / Hero / Memory wall / Tradition / Share /
   Finale — page order; Quote shown greyed out: “No photos in this section”).
3. Sees one **slot card per slot**: live current preview (merged `src` from
   `GET /api/content`), owner label (§1), “customized” badge if
   `hasOverride`, and inputs: file picker + caption/alt/note fields **only
   where the slot has them** (slots marked “none” show the uploader + alt only).
4. Chooses a photo → file uploads via `POST /api/upload` (progress + 5 MB/type
   errors surfaced inline) → preview swaps to the new photo **before saving**.
5. Edits text where offered (character counters matching §3 limits).
6. Presses **Save** → `POST /api/content` → success toast + badge flips to
   “customized”. **Reset to original** → `DELETE /api/content?id=…`.
7. **Live instantly: no rebuild.** Public sections fetch `GET /api/content` at
   runtime (client components, `cache: "no-store"`), so the next visit/refresh
   shows the new photo. (Local demo: same port-3011 server serves both site
   and `/admin`; hard-refresh if a cached tab is open.)

## 10. Out of scope / extension points

- No slot creation/deletion/reordering; no cropping (CSS `object-cover`
  handles it); no visitor-photo moderation (existing memories flow untouched).
- Extra editable copy (quote text, kushe rows, thank-you tagline) = new
  `kind: "text"` entries in `SLOTS` — no contract change.
- Env note: serve/verify on port **3011** only (never `:3000`); headless
  Chromium via `playwright-core` + `/home/nitride/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`
  only if visual confirmation is needed.

## ADR-001: Instant (client-fetch) overrides, not build-time

Context: owner expects “save → live”; static export or build-time injection
would need a rebuild per photo. Decision: runtime `GET /api/content` merged
client-side with compiled-default fallback. Consequence: + instant updates,
site immune to CMS failure; − first paint uses defaults (fine — overrides are
same-aspect swaps), one extra small fetch per page load.

## ADR-002: File store at `.data/site-content.json`, mirroring memories

Context: existing, proven `lib/memories.ts` load/save + `POST /api/upload`
patterns. Decision: copy the pattern (`lib/site-content.ts`), don't introduce
a DB/Blob dependency for the demo. Consequence: + Backend agent works from a
known template, zero new infra; − Vercel-ephemeral (documented swap points,
§5); acceptable because Blob URLs already pass validation when the swap happens.

## ADR-003: Partial overrides keyed by stable slot id

Context: defaults will evolve (new photos, copy tweaks). Decision: store only
changed fields per `section.slot` id; merge at read time. Consequence: +
old overrides survive default updates, reset = key delete; − ids are forever
(no renames without a migration note).
