#!/bin/bash

echo "========================================"
echo "WSL2 메모리 상태 모니터링"
echo "========================================"
echo

echo "메모리 사용량:"
free -h
echo

echo "메모리 사용량이 많은 프로세스 (상위 10개):"
ps aux --sort=-%mem | head -11
echo

echo "스왑 사용량:"
swapon --show
echo

echo "메모리 상세 정보:"
cat /proc/meminfo | grep -E "(MemTotal|MemFree|MemAvailable|SwapTotal|SwapFree)"
echo

echo "시스템 로드:"
uptime
echo

echo "WSL2 설정:"
cat /etc/wsl.conf 2>/dev/null || echo "WSL 설정 파일이 없습니다"
echo
