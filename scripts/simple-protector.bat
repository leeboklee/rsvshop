@echo off
setlocal enabledelayedexpansion

:: RSVShop 간단한 보호 시스템
:: taskkill /f /im node.exe에 대응하는 가장 간단한 방법

echo 🛡️ RSVShop 간단한 보호 시스템을 시작합니다...

:: 포트 설정
set PORT=4900
set MAX_RESTARTS=10
set RESTART_DELAY=3

:: 카운터 초기화
set RESTART_COUNT=0

:start_server
echo.
echo 🚀 개발 서버를 시작합니다 (시도: %RESTART_COUNT%/%MAX_RESTARTS%)
echo 📍 http://localhost:%PORT%
echo 📍 관리자: http://localhost:%PORT%/admin
echo.

:: 포트 확인 및 해제
netstat -ano | findstr :%PORT% >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔴 포트 %PORT%이 사용 중입니다. 프로세스를 종료합니다...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT%') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

:: 개발 서버 시작
echo 🚀 Next.js 개발 서버를 시작합니다...
npx next dev -p %PORT% -H 0.0.0.0 --turbo

:: 서버가 종료되었을 때
echo.
echo 📴 서버가 종료되었습니다.

:: 재시작 시도
if %RESTART_COUNT% lss %MAX_RESTARTS% (
    set /a RESTART_COUNT+=1
    echo 🔄 재시작 시도 %RESTART_COUNT%/%MAX_RESTARTS% (%RESTART_DELAY%초 후)
    timeout /t %RESTART_DELAY% /nobreak >nul
    goto start_server
) else (
    echo ❌ 최대 재시작 횟수 초과 (%MAX_RESTARTS%회)
    echo 수동으로 서버를 시작해주세요.
    pause
) 