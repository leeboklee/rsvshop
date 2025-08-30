#!/usr/bin/env bash
set -euo pipefail

# Safe restart script for Next dev on port 4900
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=4900
LOGDIR="$PROJECT_ROOT/logs"
LOGFILE="$LOGDIR/dev-restart.log"

mkdir -p "$LOGDIR"

echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Restart requested" >> "$LOGFILE"

# Find PID listening on PORT
PID=$(ss -tlnp 2>/dev/null | awk -v p=":$PORT" '$4 ~ p {print $0}' | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | head -n1 || true)

if [ -n "$PID" ]; then
  CMDLINE=$(ps -p "$PID" -o args= || true)
  echo "Found PID=$PID CMD=[$CMDLINE]" >> "$LOGFILE"

  # Only kill if the process command includes the project path
  if echo "$CMDLINE" | grep -q "$PROJECT_ROOT"; then
    echo "Killing PID $PID (belongs to project)" >> "$LOGFILE"
    kill -9 "$PID" || true
    sleep 1
  else
    echo "PID $PID does not belong to project; not killed: [$CMDLINE]" >> "$LOGFILE"
    echo "Aborting restart to avoid killing unrelated processes." >> "$LOGFILE"
    exit 1
  fi
else
  echo "No process found listening on port $PORT" >> "$LOGFILE"
fi

# Start dev server in background, log output
cd "$PROJECT_ROOT"
nohup npm run dev > "$LOGFILE" 2>&1 &
NEW_PID=$!
sleep 1
if ps -p "$NEW_PID" > /dev/null 2>&1; then
  echo "Started npm run dev (PID=$NEW_PID) — logs: $LOGFILE" >> "$LOGFILE"
  echo "OK: started (PID=$NEW_PID)"
  exit 0
else
  echo "Failed to start npm run dev — check $LOGFILE" >> "$LOGFILE"
  echo "ERROR: failed to start" >&2
  exit 2
fi
