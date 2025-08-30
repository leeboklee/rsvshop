@echo off
echo 🛡️ 브라우저 오류 모니터링 터미널 시작
echo 📍 서버: http://localhost:4900
echo 📍 로그: logs/browser-errors.json
echo.
echo ⌨️  키보드 단축키:
echo    q: 종료  s: 통계  c: 클리어  h: 도움말
echo.
echo ─────────────────────────────────────────
echo.

cd /d "%~dp0"
node scripts/error-monitor-terminal.js

pause
