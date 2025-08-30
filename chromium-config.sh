#!/bin/bash

echo "========================================"
echo "WSL2 크로미움 최적화 설정"
echo "========================================"
echo

# 메모리 제한 설정
export CHROMIUM_FLAGS="--disable-gpu --disable-software-rasterizer --disable-dev-shm-usage --no-sandbox --disable-setuid-sandbox --disable-web-security --disable-features=VizDisplayCompositor"

# DISPLAY 설정
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0.0

echo "크로미움 플래그 설정:"
echo "$CHROMIUM_FLAGS"
echo

echo "DISPLAY 설정: $DISPLAY"
echo

echo "메모리 상태:"
free -h
echo

echo "크로미움 실행 테스트 (헤드리스 모드):"
echo "----------------------------------------"
chromium-browser --headless $CHROMIUM_FLAGS --dump-dom https://www.google.com | head -3
echo

echo "크로미움 실행 테스트 (원격 디버깅 모드):"
echo "----------------------------------------"
chromium-browser --headless $CHROMIUM_FLAGS --remote-debugging-port=9222 &
sleep 3
echo "크로미움 프로세스 확인:"
ps aux | grep chromium | grep -v grep
echo

echo "원격 디버깅 포트 확인:"
netstat -tlnp | grep 9222 || echo "포트 9222가 열리지 않았습니다"
echo
