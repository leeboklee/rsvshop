@echo off
echo 🤖 AI 오류 리포터 시작
echo 📍 서버: http://localhost:4900
echo 📍 로그: logs/browser-errors.json
echo.
echo 🎯 사용자가 버튼을 누르면 즉시 AI에게 전송됩니다!
echo.
echo ─────────────────────────────────────────
echo.

cd /d "%~dp0"
node scripts/ai-error-reporter.js

pause
