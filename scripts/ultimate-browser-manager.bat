@echo off
setlocal enabledelayedexpansion
:: RSVShop 궁극의 브라우저 매니저
:: Windows 배치 파일 기반 (taskkill 완전 보호)

echo 🛡️ RSVShop 궁극의 브라우저 매니저를 시작합니다...
echo 💡 이 스크립트는 taskkill /f /im python.exe에도 영향받지 않습니다!

set PORT=4900
set APP_URL=http://localhost:4900
set ADMIN_URL=http://localhost:4900/admin
set CHECK_INTERVAL=5
set BROWSER_OPENED=0

:monitor_loop
echo.
echo 🔍 포트 %PORT% 상태를 확인합니다...

:: 포트 사용 여부 확인
netstat -ano | findstr :%PORT% >nul 2>&1
if %errorlevel% equ 0 (
    if !BROWSER_OPENED! equ 0 (
        echo 🚀 서버가 실행 중입니다. 브라우저를 엽니다...
        echo 🌐 앱 페이지를 엽니다: %APP_URL%
        start "" "%APP_URL%"
        ping -n 3 127.0.0.1 >nul
        echo 🌐 관리자 페이지를 엽니다: %ADMIN_URL%
        start "" "%ADMIN_URL%"
        set BROWSER_OPENED=1
        echo ✅ 브라우저가 열렸습니다!
    )
) else (
    if !BROWSER_OPENED! equ 1 (
        echo 📴 서버가 중단되었습니다.
        set BROWSER_OPENED=0
    )
)

echo 💤 %CHECK_INTERVAL%초 후 다시 확인합니다...
ping -n %CHECK_INTERVAL% 127.0.0.1 >nul
goto monitor_loop 