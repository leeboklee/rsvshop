#!/usr/bin/env bash
# Kill process listening on the given port (default 4900) safely in WSL
PORT=${1:-4900}
# Find pid listening on the port
PID=$(ss -tlnp 2>/dev/null | awk -v port=":${PORT}" '$4 ~ port { match($0, /pid=([0-9]+)/, m); if (m[1]) print m[1] }')
if [ -z "$PID" ]; then
  echo "No process found on port $PORT"
  exit 0
fi
# Check process name
PROC_NAME=$(ps -p $PID -o comm=)
# Only allow killing node/next-server processes
if [[ "$PROC_NAME" =~ "node" || "$PROC_NAME" =~ "next-server" || "$PROC_NAME" =~ "next" ]]; then
  echo "Killing process $PID ($PROC_NAME) on port $PORT"
  kill -9 $PID
  sleep 0.2
  echo "Killed"
  exit 0
else
  echo "Process on port $PORT is $PROC_NAME; refusing to kill automatically"
  exit 1
fi
