@echo off
chcp 65001 >nul
title RSVShop Windows 자동 시작 도구

echo 🚀 RSVShop Windows 자동 시작 도구
echo.

REM WSL이 실행 중인지 확인
echo 📋 WSL 상태 확인 중...
wsl --status >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  WSL이 실행되지 않음. 시작 중...
    wsl --shutdown >nul 2>&1
    timeout /t 2 /nobreak >nul
    wsl
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ WSL 정상 실행 중
)

echo.
echo 🔧 RSVShop 자동 복구 실행 중...
wsl bash -c "cd ~/projects/rsvshop && bash ./scripts/auto-recovery.sh"

echo.
echo 🚀 서버 자동 시작 중...
start "RSVShop Server" wsl bash -c "cd ~/projects/rsvshop && npm run start:safe"

echo.
echo ⏳ 서버 시작 대기 중...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 최종 상태 확인 중...
wsl bash -c "cd ~/projects/rsvshop && ss -tlnp | grep 4900" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ RSVShop 서버 정상 실행 중
    echo 🌐 http://localhost:4900 에서 서비스 확인 가능
    start http://localhost:4900
) else (
    echo ❌ 서버 시작 실패. 수동 확인 필요
)

echo.
echo 🎉 자동 시작 완료!
pause
