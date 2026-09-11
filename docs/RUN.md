# BUWA — Build & Serve (RUN)

> Hosting: **GitHub Pages (static only — no backend).**
> `next.config.mjs` uses `output: "export"` + `images.unoptimized`.
> Memories/postcards are 100% client-side (canvas + localStorage).
> `docs/cms-spec.md` is SUPERSEDED (it assumed a server) — to change
> pictures, replace files in `public/images/` (same filenames) and rebuild.

## Prereqs

- Node 20+ (`node --version`), deps installed (`npm ci` or `npm install`)
- Workdir: `/mnt/hdd/HDD/Codes/Father's Day`

## Build

```bash
npm run build
```

Skip the build if `.next/BUILD_ID` + `.next/required-server-files.json`
exist and are newer than everything under `app/ components/ lib/ hooks/`:

```bash
find app components lib hooks -type f -newer .next/BUILD_ID | head
# empty output = .next is fresh, no rebuild needed
```

If `pgrep -f "next build"` shows a build running (another agent),
**wait** — never run a concurrent build.

## Serve

```bash
./scripts/serve.sh          # build-if-missing → start :3000 → health check
npm run start -- --port 3000  # manual equivalent; view at http://localhost:3000
```

## GitHub Pages deploy (project page)

Live URL: `https://nitride27.github.io/fathers-day/` — `basePath` +
`assetPrefix` are set to `/fathers-day` in `next.config.mjs`, so local
preview must also be served under that subpath. Pushing to `main`
auto-deploys via `.github/workflows/deploy.yml` (build → `out/` →
Pages). First-time repo setup: Settings → Pages → Source: GitHub Actions.

## Ports

- `:3000` — the real site (owner/Frontend serves here; do not squat it)
- `:3006` — DevOps checks; `:3003–:3005` belong to other agents

## Logs

- Tail: `tail -f /tmp/buwa.log`
- DevOps port checks: `/tmp/buwa-3006.log`

## Restart when the server is reaped

Background servers die between sessions. Symptom: connection refused
on :3000, or `next start` failing with "Could not find a production
build" (means `.next` was wiped → rebuild first). Recovery:

```bash
pkill -f "next-server" 2>/dev/null; sleep 1
./scripts/serve.sh
```
