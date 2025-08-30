@echo off
:: 백그라운드 브라우저 모니터링

set TARGET_PORT=4900
set CHECK_INTERVAL=30

:monitor_loop
echo [%time%] 브라우저 모니터링 중...

:: 서버 상태 확인
netstat -ano | findstr :%TARGET_PORT% >nul
if errorlevel 1 (
    echo [%time%] ⚠️ 서버 중단됨 - 브라우저 정리
    taskkill /F /IM chrome.exe /FI "WINDOWTITLE eq *localhost:%TARGET_PORT%*" >nul 2>&1
)

:: 30초 대기
ping -n %CHECK_INTERVAL% 127.0.0.1 >nul

goto monitor_loop
