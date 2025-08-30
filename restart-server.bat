@echo off
echo RSVShop 서버 재시작 중...
echo.

echo 1. 기존 프로세스 종료...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 2. WSL 환경에서 서버 시작...
wsl -d Ubuntu -e bash -c "cd /home/rsvshop/projects/rsvshop && npm run dev"

echo.
echo 서버가 시작되었습니다. http://localhost:4900
pause
