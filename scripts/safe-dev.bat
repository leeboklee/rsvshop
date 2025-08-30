@echo off
setlocal enabledelayedexpansion

:: RSVShop 안전 개발 환경 스크립트
:: taskkill /f /im node.exe에 대응하는 보호 시스템

echo 🛡️ RSVShop 안전 개발 환경을 시작합니다...

:: 포트 확인
set PORT=4900
echo 📊 포트 %PORT% 상태 확인 중...

:: 포트 사용 여부 확인
netstat -ano | findstr :%PORT% >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔴 포트 %PORT%이 사용 중입니다. 프로세스를 종료합니다...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT%') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

:: 백업 프로세스 시작
echo 🚀 백업 프로세스를 시작합니다...
start /B cmd /c "node scripts/process-protector.js start"

:: 메인 개발 서버 시작
echo 🚀 메인 개발 서버를 시작합니다...
echo 📍 http://localhost:%PORT%
echo 📍 관리자: http://localhost:%PORT%/admin
echo.
echo 💡 팁: Ctrl+C로 종료할 수 있습니다.
echo 💡 백업 프로세스가 자동으로 서버를 재시작합니다.

:: 개발 서버 시작
npx next dev -p %PORT% -H 0.0.0.0 --turbo

:: 종료 시 정리
echo.
echo 🛑 개발 환경을 종료합니다...
taskkill /F /IM node.exe >nul 2>&1
echo ✅ 정리 완료 