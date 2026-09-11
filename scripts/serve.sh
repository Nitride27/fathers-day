#!/usr/bin/env bash
# BUWA safe-serve: rebuild only if the prod build is missing/incomplete,
# otherwise reuse .next, then serve on :3000 with a health check.
# Usage: ./scripts/serve.sh            (overrides: PORT=3000 LOG=/tmp/buwa.log)
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-3000}"
LOG="${LOG:-/tmp/buwa.log}"

# Don't race another agent's build — wait up to ~5 min, then abort.
# NOTE: bracket trick ([n]ext) so pgrep never matches this script's own shell.
for i in $(seq 1 30); do
  pgrep -f "[n]ext build" >/dev/null || break
  echo "next build in progress (wait $i/30)..."
  sleep 10
done
if pgrep -f "[n]ext build" >/dev/null; then
  echo "A build is still running; aborting serve to avoid a fight."
  exit 1
fi

if [ ! -f .next/BUILD_ID ] || [ ! -f .next/required-server-files.json ]; then
  echo "No usable .next build — running npm run build..."
  npm run build
else
  echo ".next build present ($(cat .next/BUILD_ID)) — skipping build."
fi

echo "Starting prod server on :$PORT (log: $LOG)..."
nohup npm run start -- --port "$PORT" >"$LOG" 2>&1 &
SRV_PID=$!
sleep 3
if curl -sf "http://localhost:$PORT/" >/dev/null; then echo "OK  /"; else echo "FAIL /"; fi
if curl -sf "http://localhost:$PORT/api/memories" >/dev/null; then echo "OK  /api/memories"; else echo "FAIL /api/memories"; fi
echo "Serving at http://localhost:$PORT (pid $SRV_PID)"
