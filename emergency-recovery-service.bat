@echo off
chcp 65001 >nul
title RSVShop 긴급 복원 시스템

:: 프로젝트 경로로 이동
cd /d "C:\codist\rsvshop"

echo.
echo ========================================
echo 🚨 RSVShop 긴급 복원 시스템 관리
echo ========================================
echo.

:menu
echo 📋 메뉴를 선택하세요:
echo.

echo 1. 🔧 Windows 서비스로 설치 (권장)
echo 2. 🚀 독립 실행 (임시)
echo 3. 📊 서비스 상태 확인
echo 4. ⏹️  서비스 중지
echo 5. 🗑️  서비스 제거
echo 6. 🌐 브라우저에서 열기
echo 7. ❌ 종료
echo.

set /p choice="선택 (1-7): "

if "%choice%"=="1" goto install_service
if "%choice%"=="2" goto run_standalone
if "%choice%"=="3" goto check_status
if "%choice%"=="4" goto stop_service
if "%choice%"=="5" goto uninstall_service
if "%choice%"=="6" goto open_browser
if "%choice%"=="7" goto exit
goto menu

:install_service
echo.
echo 🚀 Windows 서비스 설치 중...
echo ⚠️  관리자 권한이 필요합니다!
echo.
node scripts/install-windows-service.js install
echo.
echo ✅ 설치 완료! 이제 Cursor IDE를 종료해도 http://localhost:4901 에 접속할 수 있습니다.
echo.
pause
goto menu

:run_standalone
echo.
echo 🚀 독립 실행 모드 시작...
echo 📍 접속 주소: http://localhost:4901
echo ⚠️  이 창을 닫으면 서비스가 중단됩니다.
echo.
node scripts/db-emergency-recovery.js
goto menu

:check_status
echo.
echo 📊 서비스 상태 확인 중...
echo.
node scripts/install-windows-service.js status
echo.
pause
goto menu

:stop_service
echo.
echo ⏹️  서비스 중지 중...
echo.
node scripts/install-windows-service.js stop
echo.
pause
goto menu

:uninstall_service
echo.
echo 🗑️  서비스 제거 중...
echo ⚠️  관리자 권한이 필요합니다!
echo.
node scripts/install-windows-service.js uninstall
echo.
pause
goto menu

:open_browser
echo.
echo 🌐 브라우저에서 열기...
echo.
start http://localhost:4901
echo.
pause
goto menu

:exit
echo.
echo 👋 종료합니다.
exit 