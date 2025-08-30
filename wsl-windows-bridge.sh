#!/bin/bash

echo "========================================"
echo "WSL2 <-> Windows 브리지 도구"
echo "========================================"
echo

echo "[1] Windows 시스템 메모리 (wsl 명령어 사용):"
echo "----------------------------------------"
wsl.exe -d Ubuntu -e cmd.exe /c "wmic computersystem get TotalPhysicalMemory /format:value"
echo

echo "[2] Windows 프로세스 목록 (wsl 명령어 사용):"
echo "----------------------------------------"
wsl.exe -d Ubuntu -e cmd.exe /c "tasklist /fi \"memusage gt 100\" /fo table"
echo

echo "[3] WSL2 메모리 상태:"
echo "----------------------------------------"
free -h
echo

echo "[4] WSL2 프로세스 (메모리 사용량 순):"
echo "----------------------------------------"
ps aux --sort=-%mem | head -6
echo

echo "[5] 통합 메모리 분석:"
echo "----------------------------------------"
echo "WSL2 메모리 사용률:"
free | grep Mem | awk '{printf "사용률: %.1f%%\n", $3/$2 * 100.0}'
echo

echo "Windows 메모리 정보 (간접 확인):"
wsl.exe -d Ubuntu -e cmd.exe /c "wmic OS get FreePhysicalMemory /format:value" 2>/dev/null | head -1
echo
