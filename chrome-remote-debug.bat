@echo off
echo ========================================
echo Windows 크롬 원격 디버깅 모드
echo ========================================
echo.

echo [1] 기존 크롬 프로세스 종료:
taskkill /f /im chrome.exe 2>nul
echo.

echo [2] 원격 디버깅 모드로 크롬 실행:
start chrome.exe --remote-debugging-port=9222 --disable-gpu --disable-software-rasterizer --disable-dev-shm-usage
echo.

echo [3] 크롬 프로세스 확인:
timeout /t 3 /nobreak >nul
tasklist /fi "imagename eq chrome.exe" /fo table
echo.

echo [4] 원격 디버깅 포트 확인:
netstat -an | findstr :9222
echo.

echo [5] WSL2에서 연결 테스트:
echo "WSL2에서 다음 명령어 실행:"
echo "curl http://localhost:9222/json/version"
echo.

pause
