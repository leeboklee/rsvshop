@echo off
:: Prisma 쿼리 엔진 잠금 문제 자동 해결
echo 🔧 Prisma 쿼리 엔진 잠금 문제 해결 중...

:: 1. 개발 서버 중지 (백그라운드)
echo [1단계] 개발 서버 중지 중...
taskkill /F /IM node.exe >nul 2>&1
ping -n 3 127.0.0.1 >nul

:: 2. Prisma 프로세스 정리
echo [2단계] Prisma 관련 프로세스 정리...
taskkill /F /IM prisma.exe >nul 2>&1
taskkill /F /IM query-engine.exe >nul 2>&1

:: 3. 잠금 파일 정리
echo [3단계] 잠금 파일 및 임시 파일 정리...
del /Q node_modules\.prisma\client\*.tmp* >nul 2>&1
del /Q node_modules\.prisma\client\*.lock >nul 2>&1

:: 4. node_modules/.prisma 디렉토리 재생성
echo [4단계] Prisma 클라이언트 디렉토리 재생성...
rmdir /S /Q node_modules\.prisma >nul 2>&1
ping -n 2 127.0.0.1 >nul

:: 5. Prisma 클라이언트 재생성
echo [5단계] Prisma 클라이언트 재생성...
npx prisma generate

if errorlevel 1 (
    echo ❌ Prisma 클라이언트 생성 실패
    echo 💡 수동으로 다음을 시도해보세요:
    echo    1. 모든 터미널/IDE 종료
    echo    2. 컴퓨터 재시작
    echo    3. npm install
    echo    4. npx prisma generate
) else (
    echo ✅ Prisma 클라이언트 생성 성공
    
    :: 6. 데이터베이스 스키마 동기화
    echo [6단계] 데이터베이스 스키마 동기화...
    npx prisma db push
    
    echo.
    echo 🎉 Prisma 오류 해결 완료!
    echo 💡 이제 'npm run dev'로 서버를 다시 시작하세요
)

echo.
echo 📊 최종 상태:
echo ==================
dir node_modules\.prisma\client\*.dll.node 2>nul && echo ✅ 쿼리 엔진 파일 존재 || echo ❌ 쿼리 엔진 파일 없음
echo.
pause
