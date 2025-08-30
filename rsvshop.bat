@echo off
chcp 65001 >nul
title RSVShop 관리 도구
color 0A

echo ===== RSVShop 관리 도구 =====
echo.

:menu
echo 선택하세요:
echo.
echo 1. 개발 서버 시작 (npm run dev)
echo 2. 환경 설정 (node scripts/setup-env.js)
echo 3. 캐시 정리
echo 4. 포트 정리
echo 5. 데이터베이스 확인
echo 6. 메모리 최적화
echo 7. 전체 재설정
echo 0. 종료
echo.

set /p choice=번호를 입력하세요: 

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto setup-env
if "%choice%"=="3" goto clean
if "%choice%"=="4" goto port-kill
if "%choice%"=="5" goto db-check
if "%choice%"=="6" goto memory-fix
if "%choice%"=="7" goto reset
if "%choice%"=="0" goto exit
goto menu

:dev
echo.
echo 🚀 개발 서버 시작...
npm run dev
goto menu

:setup-env
echo.
echo 🔧 환경 설정...
node scripts/setup-env.js
echo.
echo ✅ 환경 설정 완료!
goto menu

:clean
echo.
echo 🧹 캐시 정리...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo ✅ 정리 완료!
goto menu

:port-kill
echo.
echo 🔄 포트 정리...
node scripts/kill-port-3900.js
echo ✅ 포트 정리 완료!
goto menu

:db-check
echo.
echo 🗄️ 데이터베이스 상태 확인...
node scripts/db-check.js
goto menu

:memory-fix
echo.
echo 💾 메모리 최적화...
node scripts/final-fix.js
goto menu

:reset
echo.
echo 🔄 전체 재설정...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
npm install
npm run dev
goto menu

:exit
echo.
echo 👋 RSVShop 관리 도구를 종료합니다.
exit 