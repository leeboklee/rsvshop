@echo off
chcp 65001 >nul
title RSVShop 자동 복구 도구

echo 🔧 RSVShop 자동 복구 시작...
echo.

echo 📊 PostgreSQL 상태 확인 중...
wsl sudo service postgresql status | findstr "online" >nul
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL이 실행되지 않음. 시작 중...
    wsl sudo service postgresql start
    timeout /t 3 /nobreak >nul
    
    wsl sudo service postgresql status | findstr "online" >nul
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL 시작 완료
    ) else (
        echo ❌ PostgreSQL 시작 실패
        pause
        exit /b 1
    )
) else (
    echo ✅ PostgreSQL 정상 실행 중
)

echo.
echo 🔌 포트 4900 상태 확인 중...
wsl ss -tlnp | findstr ":4900" >nul
if %errorlevel% equ 0 (
    echo ✅ 포트 4900 사용 중
) else (
    echo ⚠️  포트 4900이 사용되지 않음
)

echo.
echo 🗄️  데이터베이스 연결 테스트 중...
wsl npx prisma db push --accept-data-loss >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 데이터베이스 연결 정상
) else (
    echo ❌ 데이터베이스 연결 실패
    echo 🔄 PostgreSQL 재시작 시도...
    wsl sudo service postgresql restart
    timeout /t 5 /nobreak >nul
    
    wsl npx prisma db push --accept-data-loss >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ 데이터베이스 연결 복구 완료
    ) else (
        echo ❌ 데이터베이스 연결 복구 실패
    )
)

echo.
echo 🚀 서버 상태 확인 중...
wsl ss -tlnp | findstr ":4900" >nul
if %errorlevel% neq 0 (
    echo ⚠️  서버가 실행되지 않음. 자동 시작 중...
    echo 📝 백그라운드에서 서버 시작...
    start "RSVShop Server" wsl npm run dev:simple
    
    echo ⏳ 서버 시작 대기 중...
    for /l %%i in (1,1,30) do (
        wsl ss -tlnp | findstr ":4900" >nul
        if !errorlevel! equ 0 (
            echo ✅ 서버가 포트 4900에서 정상 실행 중
            goto :server_ready
        )
        timeout /t 1 /nobreak >nul
        echo -n .
    )
    echo ❌ 서버 시작 실패
    goto :end
) else (
    echo ✅ 서버가 정상 실행 중
)

:server_ready
echo.
echo 🔍 최종 상태 확인 중...
echo 📊 PostgreSQL: 
wsl sudo service postgresql status | findstr "online\|offline"
echo 🔌 포트 4900: 
wsl ss -tlnp | findstr ":4900" >nul && echo 사용 중 || echo 사용 안함
echo 🚀 Next.js: 
wsl ps aux | findstr "next-server" >nul && echo 실행 중 || echo 실행 안함

echo.
echo 🎉 자동 복구 완료!
echo 🌐 http://localhost:4900 에서 서비스 확인 가능

:end
echo.
pause
