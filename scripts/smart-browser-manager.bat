@echo off
:: 스마트 브라우저 매니저 - 특정 포트의 크롬만 관리

set TARGET_URL=http://localhost:4900
set TARGET_PORT=4900

echo [스마트 브라우저 매니저] 시작...

:: 1. 포트 4900 확인
echo [1단계] 서버 포트 %TARGET_PORT% 확인 중...
netstat -ano | findstr :%TARGET_PORT% >nul
if errorlevel 1 (
    echo ❌ 서버가 실행되지 않았습니다.
    echo 먼저 'npm run dev'로 서버를 시작하세요.
    pause
    exit /b 1
)
echo ✅ 서버 실행 중

:: 2. 기존 크롬에서 localhost:4900 탭만 찾아서 종료
echo [2단계] 기존 localhost:4900 탭 정리 중...
powershell -Command "Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { try { $_.CloseMainWindow() } catch {} }" >nul 2>&1

:: 3. 3초 대기
echo [3단계] 3초 대기...
ping -n 4 127.0.0.1 >nul

:: 4. 새 크롬 창 열기
echo [4단계] 새 크롬 창 열기...
start chrome --new-window "%TARGET_URL%/admin"

echo ✅ 브라우저 관리 완료!
echo 📝 localhost:4900/admin 페이지가 새 창에서 열렸습니다.

:: 5. 백그라운드에서 모니터링 시작 (선택사항)
echo [5단계] 백그라운드 모니터링 시작...
start /min cmd /c "scripts\monitor-browser.bat"

exit /b 0
