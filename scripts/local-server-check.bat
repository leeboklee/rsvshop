@echo off
:: 로컬 Node.js 서버 상태 점검 및 복구
echo 🔍 로컬 서버 상태 점검 시작...

:: 포트 4900 상태 확인
echo [1단계] 포트 4900 프로세스 확인...
netstat -ano | findstr :4900
if errorlevel 1 (
    echo ❌ 포트 4900에서 서버 실행되지 않음
    goto start_server
) else (
    echo ✅ 포트 4900에서 프로세스 실행 중
    
    :: 실제 응답 확인
    echo [2단계] 서버 응답 확인...
    curl -f http://localhost:4900 >nul 2>&1
    if errorlevel 1 (
        echo ❌ 서버 응답 없음 - 좀비 프로세스 정리 후 재시작
        goto kill_and_restart
    ) else (
        echo ✅ 서버 정상 응답
        goto check_admin
    )
)

:kill_and_restart
echo [복구] 포트 4900 프로세스 정리...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4900') do (
    echo 프로세스 %%a 종료 중...
    taskkill /F /PID %%a >nul 2>&1
)
ping -n 3 127.0.0.1 >nul
goto start_server

:start_server
echo [시작] npm run dev 서버 시작...
echo 서버 시작 중... 브라우저에서 http://localhost:4900/admin 확인하세요
start cmd /k "npm run dev"
echo ✅ 서버 시작 명령 실행됨
goto end

:check_admin
echo [3단계] Admin 페이지 접근 확인...
curl -f http://localhost:4900/admin >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Admin 페이지 접근 불가 - 라우팅 문제일 수 있음
) else (
    echo ✅ Admin 페이지 접근 가능
)
echo 🎉 http://localhost:4900/admin 에서 확인하세요

:end
echo.
echo 📊 현재 상태:
netstat -ano | findstr :4900
echo.
echo 💡 브라우저에서 http://localhost:4900/admin 접속해보세요
pause
