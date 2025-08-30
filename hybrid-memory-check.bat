@echo off
echo ========================================
echo 하이브리드 메모리 상태 확인
echo ========================================
echo.

echo [1] Windows 시스템 메모리 정보:
echo ----------------------------------------
wmic computersystem get TotalPhysicalMemory /format:value
wmic OS get FreePhysicalMemory /format:value
echo.

echo [2] Windows 프로세스 메모리 사용량:
echo ----------------------------------------
tasklist /fi "memusage gt 100" /fo table
echo.

echo [3] WSL2 환경 정보:
echo ----------------------------------------
wsl -d Ubuntu -e bash -c "free -h"
echo.

echo [4] WSL2 프로세스 정보:
echo ----------------------------------------
wsl -d Ubuntu -e bash -c "ps aux --sort=-%mem | head -6"
echo.

echo [5] 통합 분석:
echo ----------------------------------------
powershell "Write-Host 'Windows 메모리 사용률:' -ForegroundColor Green; $total = (Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory; $free = (Get-WmiObject -Class Win32_OperatingSystem).FreePhysicalMemory * 1024; $used = $total - $free; $usage = [math]::Round(($used / $total) * 100, 2); Write-Host '사용률: ' $usage '%' -ForegroundColor Yellow"
echo.

pause
