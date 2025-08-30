@echo off
echo [자동복구] RSVShop 서버 자동 복구 모드 시작
echo.

:: 기존 프로세스 정리
echo [1단계] 기존 프로세스 정리 중...
taskkill /f /im node.exe > nul 2>&1
timeout /t 3 > nul

:: 자동 복구 서버 시작
echo [2단계] 자동 복구 서버 시작 중...
npm run dev

:: 오류 발생 시 자동 재시작
if %errorlevel% neq 0 (
    echo [오류] 자동 복구 서버 시작 실패, 10초 후 재시작...
    timeout /t 10 > nul
    goto :start
)

echo [완료] 자동 복구 서버가 정상적으로 시작되었습니다.
pause 