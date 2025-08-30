@echo off
echo [자동화] RSVShop 서버 자동 시작
echo.

:: 포트 확인 및 프로세스 종료
echo [1단계] 포트 3900 확인 중...
netstat -ano | findstr :3900 > nul
if %errorlevel% equ 0 (
    echo [감지] 포트 3900 사용 중, 프로세스 종료 중...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3900') do (
        taskkill /f /pid %%a > nul 2>&1
    )
    timeout /t 2 > nul
)

:: 서버 시작 (자동 복구 모드)
echo [2단계] 서버 시작 중 (자동 복구 모드)...
npm run dev

:: 오류 발생 시 자동 재시작
if %errorlevel% neq 0 (
    echo [오류] 서버 시작 실패, 5초 후 재시작...
    timeout /t 5 > nul
    goto :start
)

echo [완료] 서버가 정상적으로 시작되었습니다.
pause 