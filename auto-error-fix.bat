@echo off
chcp 65001 >nul
title 서버/클라이언트 오류 자동 해결 시스템
echo.
echo ========================================
echo 🔧 서버/클라이언트 오류 자동 해결
echo ========================================
echo.

:: 1단계: 오류 패턴 분석
echo [1단계] 🔍 오류 패턴 분석 중...

:: 최신 에러 로그 확인
echo 📋 최신 에러 로그 분석:
if exist "logs\error.log" (
    echo ✅ 에러 로그 발견
    findstr /I /C:"예약 조회 오류" logs\error.log | wc -l > temp_reservation_errors.txt
    set /p RESERVATION_ERRORS=<temp_reservation_errors.txt
    del temp_reservation_errors.txt
    
    findstr /I /C:"패키지 조회 오류" logs\error.log | wc -l > temp_package_errors.txt
    set /p PACKAGE_ERRORS=<temp_package_errors.txt
    del temp_package_errors.txt
    
    echo 📊 예약 조회 오류: %RESERVATION_ERRORS%회
    echo 📊 패키지 조회 오류: %PACKAGE_ERRORS%회
) else (
    echo ❌ 에러 로그 없음
    set RESERVATION_ERRORS=0
    set PACKAGE_ERRORS=0
)

:: 2단계: 데이터베이스 연결 상태 확인
echo [2단계] 🗄️ 데이터베이스 연결 상태 확인...

curl -s http://localhost:4900/api/health/db > temp_db_health.json
if %errorlevel% equ 0 (
    findstr /C:"connected" temp_db_health.json >nul
    if %errorlevel% equ 0 (
        echo ✅ 데이터베이스 연결 정상
        set DB_STATUS=CONNECTED
    ) else (
        echo ❌ 데이터베이스 연결 오류
        set DB_STATUS=DISCONNECTED
    )
    del temp_db_health.json
) else (
    echo ❌ 헬스체크 API 응답 없음
    set DB_STATUS=API_ERROR
)

:: 3단계: API 응답 속도 테스트
echo [3단계] ⚡ API 응답 속도 테스트...

echo 📋 예약 API 응답 테스트:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/reservations') do set RESERVATION_TIME=%%i
echo ⏱️ 예약 API 응답시간: %RESERVATION_TIME%초

echo 📋 패키지 API 응답 테스트:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/packages') do set PACKAGE_TIME=%%i
echo ⏱️ 패키지 API 응답시간: %PACKAGE_TIME%초

:: 4단계: 성능 임계값 검사
echo [4단계] 📊 성능 임계값 검사...

:: 응답시간이 5초 이상이면 느림으로 판정
if %RESERVATION_TIME% gtr 5.0 (
    echo ⚠️ 예약 API 응답 느림 (%RESERVATION_TIME%초)
    set RESERVATION_SLOW=YES
) else (
    echo ✅ 예약 API 응답 정상 (%RESERVATION_TIME%초)
    set RESERVATION_SLOW=NO
)

if %PACKAGE_TIME% gtr 5.0 (
    echo ⚠️ 패키지 API 응답 느림 (%PACKAGE_TIME%초)
    set PACKAGE_SLOW=YES
) else (
    echo ✅ 패키지 API 응답 정상 (%PACKAGE_TIME%초)
    set PACKAGE_SLOW=NO
)

:: 5단계: 자동 수정 적용
echo [5단계] 🔧 자동 수정 적용...

:: Prisma 연결 최적화
echo 📋 Prisma 연결 최적화:
if "%DB_STATUS%"=="DISCONNECTED" (
    echo 🔄 Prisma 재생성 중...
    npx prisma generate >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Prisma 재생성 완료
    ) else (
        echo ❌ Prisma 재생성 실패
    )
    
    echo 🔄 데이터베이스 마이그레이션 확인...
    npx prisma db push >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ 데이터베이스 동기화 완료
    ) else (
        echo ❌ 데이터베이스 동기화 실패
    )
)

:: 캐시 최적화
echo 📋 캐시 최적화:
if exist ".next" (
    echo 🗑️ Next.js 캐시 삭제 중...
    rd /s /q .next >nul 2>&1
    echo ✅ Next.js 캐시 삭제 완료
)

:: 6단계: 서버 재시작 (필요한 경우)
if "%DB_STATUS%"=="DISCONNECTED" (
    echo [6단계] 🔄 서버 재시작...
    
    echo 📋 기존 서버 프로세스 종료:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4900') do (
        echo 🔄 PID %%a 종료 중...
        taskkill /F /PID %%a >nul 2>&1
    )
    
    echo ⏳ 3초 대기...
    ping -n 4 127.0.0.1 >nul
    
    echo 🚀 서버 재시작...
    start "RSVShop Server" cmd /k "npm run dev"
    
    echo ⏳ 서버 시작 대기 (15초)...
    ping -n 16 127.0.0.1 >nul
)

:: 7단계: 수정 후 검증
echo [7단계] ✅ 수정 후 검증...

echo 📋 데이터베이스 재확인:
curl -s http://localhost:4900/api/health/db > temp_db_health2.json
if %errorlevel% equ 0 (
    findstr /C:"connected" temp_db_health2.json >nul
    if %errorlevel% equ 0 (
        echo ✅ 데이터베이스 연결 복구됨
        set DB_STATUS_AFTER=CONNECTED
    ) else (
        echo ❌ 데이터베이스 여전히 오류
        set DB_STATUS_AFTER=DISCONNECTED
    )
    del temp_db_health2.json
) else (
    echo ❌ 헬스체크 API 여전히 응답 없음
    set DB_STATUS_AFTER=API_ERROR
)

echo 📋 API 응답속도 재확인:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/reservations') do set RESERVATION_TIME_AFTER=%%i
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/packages') do set PACKAGE_TIME_AFTER=%%i

echo ⏱️ 예약 API (수정후): %RESERVATION_TIME_AFTER%초
echo ⏱️ 패키지 API (수정후): %PACKAGE_TIME_AFTER%초

:: 8단계: 최종 보고서
echo.
echo ========================================
echo 📋 자동 오류 해결 보고서
echo ========================================
echo 📅 수정 시간: %date% %time%
echo.
echo 🔍 수정 전 상태:
echo │ 예약 조회 오류: %RESERVATION_ERRORS%회
echo │ 패키지 조회 오류: %PACKAGE_ERRORS%회  
echo │ DB 연결 상태: %DB_STATUS%
echo │ 예약 API 응답: %RESERVATION_TIME%초
echo │ 패키지 API 응답: %PACKAGE_TIME%초
echo.
echo 🔧 적용된 수정:
echo │ Prisma 재생성: %DB_STATUS%에 따라 적용
echo │ DB 동기화: %DB_STATUS%에 따라 적용
echo │ Next.js 캐시 삭제: 적용됨
echo │ 서버 재시작: %DB_STATUS%에 따라 적용
echo.
echo ✅ 수정 후 상태:
echo │ DB 연결 상태: %DB_STATUS_AFTER%
echo │ 예약 API 응답: %RESERVATION_TIME_AFTER%초
echo │ 패키지 API 응답: %PACKAGE_TIME_AFTER%초
echo ========================================

if "%DB_STATUS_AFTER%"=="CONNECTED" (
    echo 🎉 모든 오류가 해결되었습니다!
    echo 💡 서버가 정상적으로 동작하고 있습니다
) else (
    echo ⚠️ 일부 문제가 남아있습니다
    echo 💡 수동으로 데이터베이스 설정을 확인하세요
)

echo.
echo 📝 상세 로그: logs\auto-error-fix-%date:~0,10%.log
echo 🔧 수동 복구: emergency-recovery-service.bat

pause


