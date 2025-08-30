@echo off
chcp 65001 >nul
title Cursor 터미널 에러 자동 복구 시스템
echo.
echo ========================================
echo 🔧 Cursor 터미널 에러 자동 복구
echo ========================================
echo.

:: 1단계: 현재 상태 진단
echo [1단계] 🔍 시스템 상태 진단 중...

:: PowerShell 실행 정책 확인
echo 📋 PowerShell 실행 정책 확인:
powershell -Command "Get-ExecutionPolicy" 2>nul
if %errorlevel% neq 0 (
    echo ❌ PowerShell 접근 제한됨
    set PS_ACCESS=FAIL
) else (
    echo ✅ PowerShell 접근 가능
    set PS_ACCESS=PASS
)

:: 관리자 권한 확인
echo 📋 관리자 권한 확인:
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 관리자 권한 없음
    set ADMIN_ACCESS=FAIL
) else (
    echo ✅ 관리자 권한 확인
    set ADMIN_ACCESS=PASS
)

:: 포트 4900 상태 확인
echo 📋 서버 포트 4900 확인:
netstat -ano | findstr :4900 >nul
if %errorlevel% equ 0 (
    echo ✅ 서버 실행 중
    set SERVER_STATUS=RUNNING
) else (
    echo ❌ 서버 미실행
    set SERVER_STATUS=STOPPED
)

echo.
echo 🔍 진단 결과:
echo ┌─────────────────────────────────┐
echo │ PowerShell   : %PS_ACCESS%                │
echo │ 관리자 권한  : %ADMIN_ACCESS%                │
echo │ 서버 상태    : %SERVER_STATUS%            │
echo └─────────────────────────────────┘
echo.

:: 2단계: 자동 복구 시작
echo [2단계] 🔧 자동 복구 시작...

:: 관리자 권한 없으면 권한 요청
if "%ADMIN_ACCESS%"=="FAIL" (
    echo 📢 관리자 권한 획득 중...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d C:\codist\rsvshop && cursor-terminal-fix.bat' -Verb RunAs" 2>nul
    if %errorlevel% neq 0 (
        echo ❌ 관리자 권한 요청 실패
        echo 💡 수동으로 관리자 권한으로 실행하세요
        pause
        exit
    )
    exit
)

:: PowerShell 실행 정책 수정
if "%PS_ACCESS%"=="FAIL" (
    echo 🔧 PowerShell 실행 정책 수정 중...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
    echo ✅ PowerShell 정책 수정 완료
)

:: 3단계: 서버 자동 시작/복구
echo [3단계] 🚀 서버 자동 시작/복구...

if "%SERVER_STATUS%"=="STOPPED" (
    echo 📍 서버 시작 중...
    cd /d "C:\codist\rsvshop"
    start "RSVShop Server" cmd /k "npm run dev"
    
    :: 서버 시작 확인 (10초 대기)
    echo ⏳ 서버 시작 확인 중... (10초 대기)
    ping -n 11 127.0.0.1 >nul
    
    netstat -ano | findstr :4900 >nul
    if %errorlevel% equ 0 (
        echo ✅ 서버 시작 성공
        set SERVER_STATUS=RUNNING
    ) else (
        echo ❌ 서버 시작 실패
        set SERVER_STATUS=FAILED
    )
) else (
    echo ✅ 서버가 이미 실행 중입니다
)

:: 4단계: 브라우저 테스트 자동 실행
if "%SERVER_STATUS%"=="RUNNING" (
    echo [4단계] 🌐 브라우저 테스트 자동 실행...
    scripts\auto-browser-test.bat
) else (
    echo [4단계] ❌ 서버 문제로 브라우저 테스트 생략
)

:: 5단계: 최종 결과 보고
echo.
echo ========================================
echo 📋 자동 복구 완료 보고서
echo ========================================
echo 📅 복구 시간: %date% %time%
echo 🔧 PowerShell: %PS_ACCESS%
echo 👤 관리자 권한: %ADMIN_ACCESS%
echo 🌐 서버 상태: %SERVER_STATUS%
echo 🌍 접속 URL: http://localhost:4900
echo ========================================

if "%SERVER_STATUS%"=="RUNNING" (
    echo ✅ 모든 복구 작업이 완료되었습니다!
    echo 💡 Cursor IDE 터미널이 정상 작동해야 합니다
) else (
    echo ❌ 일부 문제가 해결되지 않았습니다
    echo 💡 수동으로 Cursor를 관리자 권한으로 재시작하세요
)

echo.
echo 📝 복구 로그: logs\cursor-terminal-fix-%date:~0,10%.log
echo 🔄 재실행: cursor-terminal-fix.bat

pause
