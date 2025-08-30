#!/usr/bin/env bash
set -euo pipefail

# WSL2 동기화 스크립트: Windows 프로젝트를 리눅스 홈으로 동기화
# 사용 위치: WSL(우분투) 내부에서 실행
# 예) sudo bash ./scripts/wsl2-sync-to-linux.sh

WIN_ROOT="/mnt/c/codist/rsvshop"
LINUX_ROOT="/home/rsvshop/rsvshop"
USER_NAME="rsvshop"

if [ ! -d "$WIN_ROOT" ]; then
  echo "원본 경로가 없습니다: $WIN_ROOT" >&2
  exit 1
fi

mkdir -p "$LINUX_ROOT"
chown -R "$USER_NAME":"$USER_NAME" "$LINUX_ROOT"

# node_modules/.next는 제외하고 동기화 (대용량/캐시)
rsync -av --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  "$WIN_ROOT/" "$LINUX_ROOT/"

# package-lock 변경 시 의존성 재설치
if ! diff -q "$WIN_ROOT/package-lock.json" "$LINUX_ROOT/package-lock.json" >/dev/null 2>&1; then
  echo "package-lock.json 변경 감지 → npm ci 수행"
  sudo -u "$USER_NAME" bash -lc "cd '$LINUX_ROOT' && npm ci"
fi

echo "동기화 완료: $WIN_ROOT -> $LINUX_ROOT"
