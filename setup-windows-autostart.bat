@echo off
chcp 65001 >nul
title RSVShop Windows 자동 시작 설정

echo 🔧 RSVShop Windows 자동 시작 설정
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 관리자 권한이 필요합니다.
    echo 🔄 이 파일을 관리자 권한으로 실행해주세요.
    pause
    exit /b 1
)

echo ✅ 관리자 권한 확인됨
echo.

REM 현재 디렉토리 확인
set CURRENT_DIR=%~dp0
echo 📁 현재 디렉토리: %CURRENT_DIR%

REM 작업 스케줄러에 등록
echo 📋 Windows 작업 스케줄러에 등록 중...

REM 기존 작업 삭제 (있다면)
schtasks /delete /tn "RSVShop Auto Start" /f >nul 2>&1

REM 새 작업 생성
schtasks /create /tn "RSVShop Auto Start" /tr "%CURRENT_DIR%start-rsvshop-windows.bat" /sc onlogon /ru "%USERNAME%" /f

if %errorlevel% equ 0 (
    echo ✅ Windows 시작 시 자동 실행 설정 완료!
    echo.
    echo 📋 설정된 내용:
    echo    - 작업 이름: RSVShop Auto Start
    echo    - 실행 시점: Windows 로그인 시
    echo    - 실행 파일: %CURRENT_DIR%start-rsvshop-windows.bat
    echo.
    echo 🚀 이제 Windows 시작 시 자동으로 RSVShop이 시작됩니다.
    echo.
    echo 📝 작업 스케줄러 확인 방법:
    echo    1. Win + R → taskschd.msc 입력
    echo    2. "RSVShop Auto Start" 작업 확인
    echo.
    echo 🔧 수동으로 실행하려면:
    echo    %CURRENT_DIR%start-rsvshop-windows.bat
) else (
    echo ❌ 작업 스케줄러 등록 실패
    echo 🔄 수동으로 설정해주세요.
)

echo.
echo 🎉 설정 완료!
pause
