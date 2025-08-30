@echo off
echo 4900 포트 문제 해결 중...
echo.

echo 1. 기존 프로세스 종료...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo 2. WSL 포트 확인...
wsl -d Ubuntu -e bash -c "ss -tlnp | grep :4900"

echo 3. WSL에서 서버 시작 (포트 바인딩 수정)...
wsl -d Ubuntu -e bash -c "cd /home/rsvshop/projects/rsvshop && HOSTNAME=0.0.0.0 npm run dev"

echo.
echo 서버가 시작되었습니다. http://localhost:4900
echo 만약 여전히 안 열린다면 http://127.0.0.1:4900 을 시도해보세요.
pause
