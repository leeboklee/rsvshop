@echo off
echo 🗄️ DB 자동 수정 시스템 시작
echo 📍 서버: http://localhost:4900
echo 📍 API: /api/health/db, /api/admin/prisma-status
echo.
echo 🔧 자동 수정 기능:
echo    - DB 연결 상태 감지
echo    - Prisma 스키마 생성
echo    - 마이그레이션 실행
echo    - 10초마다 자동 확인
echo.
echo ─────────────────────────────────────────
echo.

cd /d "%~dp0"
node scripts/db-auto-fixer.js

pause
