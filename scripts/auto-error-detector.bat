@echo off
chcp 65001 >nul
title Real-Time Error Detector & Auto Fix
echo.
echo ========================================
echo Real-Time Error Detector & Auto Fix
echo ========================================
echo.

:monitor_loop
echo [%time%] Checking for errors...

:: 1. 서버 상태 확인
curl -s http://localhost:4900/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Server not responding - Restarting...
    taskkill /F /IM node.exe >nul 2>&1
    start /B npm run dev
    timeout /t 5 >nul
    goto monitor_loop
)

:: 2. Prisma 상태 확인
curl -s http://localhost:4900/api/admin/prisma-status > temp_prisma.json
findstr "disconnected" temp_prisma.json >nul
if not errorlevel 1 (
    echo ❌ Prisma disconnected - Fixing...
    npx prisma generate >nul 2>&1
    npx prisma db push >nul 2>&1
    del temp_prisma.json
    goto monitor_loop
)

:: 3. API 오류 확인
curl -s http://localhost:4900/api/admin/reservations >nul 2>&1
if errorlevel 1 (
    echo ❌ Reservations API error - Fixing...
    taskkill /F /IM node.exe >nul 2>&1
    start /B npm run dev
    timeout /t 5 >nul
    goto monitor_loop
)

curl -s http://localhost:4900/api/admin/packages >nul 2>&1
if errorlevel 1 (
    echo ❌ Packages API error - Fixing...
    taskkill /F /IM node.exe >nul 2>&1
    start /B npm run dev
    timeout /t 5 >nul
    goto monitor_loop
)

:: 4. 데이터베이스 연결 확인
curl -s http://localhost:4900/api/health/db > temp_db.json
findstr "disconnected" temp_db.json >nul
if not errorlevel 1 (
    echo ❌ Database disconnected - Fixing...
    npx prisma db push >nul 2>&1
    del temp_db.json
    goto monitor_loop
)

:: 5. 페이지 로딩 확인
curl -s http://localhost:4900/admin >nul 2>&1
if errorlevel 1 (
    echo ❌ Admin page error - Fixing...
    taskkill /F /IM node.exe >nul 2>&1
    start /B npm run dev
    timeout /t 5 >nul
    goto monitor_loop
)

:: 6. 성능 체크
curl -w "Response time: %%{time_total}s\n" -o nul -s http://localhost:4900/api/admin/stats > temp_perf.txt
set /p perf_time=<temp_perf.txt
echo ✅ All systems healthy - %perf_time%
del temp_perf.json temp_db.json temp_perf.txt >nul 2>&1

:: 2초 대기 후 다시 체크
timeout /t 2 >nul
goto monitor_loop
