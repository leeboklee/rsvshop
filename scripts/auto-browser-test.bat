@echo off
:: 자동 브라우저 점검 - 열기 → 테스트 → 종료
echo 🤖 자동 브라우저 점검 시작...

:: ==========================================
:: 1단계: 서버 상태 사전 확인
:: ==========================================
echo [1단계] 🔍 서버 상태 사전 확인
netstat -ano | findstr :4900 >nul
if errorlevel 1 (
    echo ❌ 서버가 실행되지 않았습니다
    echo 💡 먼저 무적서버를 시작하세요
    pause
    exit /b 1
)
echo ✅ 서버 실행 중 확인됨

:: ==========================================
:: 2단계: 브라우저 자동 열기
:: ==========================================
echo [2단계] 🌐 브라우저 자동 열기
echo 📱 Chrome에서 admin 페이지 열기 중...
start chrome --new-window --app=http://localhost:4900/admin
echo ✅ 브라우저 열기 완료

:: 브라우저 로딩 대기
echo ⏳ 페이지 로딩 대기 중... (5초)
ping -n 6 127.0.0.1 >nul

:: ==========================================
:: 3단계: 자동 점검 실행
:: ==========================================
echo [3단계] 🔍 자동 점검 실행

:: 기본 연결 테스트
echo 📋 기본 연결 테스트:
curl -f http://localhost:4900 >nul 2>&1
if errorlevel 1 (
    echo ❌ 기본 연결 실패
    set BASIC_TEST=FAIL
) else (
    echo ✅ 기본 연결 성공
    set BASIC_TEST=PASS
)

:: Admin 페이지 테스트
echo 📋 Admin 페이지 테스트:
curl -f http://localhost:4900/admin >nul 2>&1
if errorlevel 1 (
    echo ❌ Admin 페이지 접근 실패
    set ADMIN_TEST=FAIL
) else (
    echo ✅ Admin 페이지 접근 성공
    set ADMIN_TEST=PASS
)

:: API 헬스체크
echo 📋 API 헬스체크:
curl -f http://localhost:4900/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ API 헬스체크 실패
    set API_TEST=FAIL
) else (
    echo ✅ API 헬스체크 성공
    set API_TEST=PASS
)

:: 응답 시간 테스트
echo 📋 응답 시간 테스트:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/admin') do set RESPONSE_TIME=%%i
echo ⏱️ 응답 시간: %RESPONSE_TIME%초

:: ==========================================
:: 4단계: 점검 결과 분석
:: ==========================================
echo [4단계] 📊 점검 결과 분석

echo.
echo 🔍 점검 결과 요약:
echo ┌─────────────────────────────────┐
echo │ 기본 연결    : %BASIC_TEST%                │
echo │ Admin 페이지 : %ADMIN_TEST%                │
echo │ API 헬스체크 : %API_TEST%                 │
echo │ 응답 시간    : %RESPONSE_TIME%초            │
echo └─────────────────────────────────┘

:: 종합 판정
if "%BASIC_TEST%"=="PASS" if "%ADMIN_TEST%"=="PASS" if "%API_TEST%"=="PASS" (
    echo ✅ 종합 판정: 모든 테스트 통과!
    set OVERALL_RESULT=PASS
) else (
    echo ❌ 종합 판정: 일부 테스트 실패
    set OVERALL_RESULT=FAIL
)

:: ==========================================
:: 5단계: 점검 완료 후 브라우저 자동 종료
:: ==========================================
echo [5단계] 🧹 점검 완료 - 브라우저 자동 종료

echo ⏳ 결과 확인 시간 (3초)...
ping -n 4 127.0.0.1 >nul

echo 🔧 테스트용 Chrome 창 종료 중...
:: localhost:4900 관련 Chrome 프로세스만 종료
powershell -Command "Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like '*localhost:4900*' -or $_.MainWindowTitle -like '*admin*' } | ForEach-Object { try { $_.CloseMainWindow(); Start-Sleep -Milliseconds 500; if (!$_.HasExited) { $_.Kill() } } catch {} }"

echo ⏳ 종료 처리 대기...
ping -n 3 127.0.0.1 >nul

echo ✅ 브라우저 종료 완료

:: ==========================================
:: 6단계: 최종 보고서
:: ==========================================
echo [6단계] 📋 최종 보고서

echo.
echo 🤖 자동 브라우저 점검 완료!
echo ==========================================
echo 📅 점검 시간: %date% %time%
echo 🔍 점검 결과: %OVERALL_RESULT%
echo 🌐 대상 URL: http://localhost:4900/admin
echo ⏱️ 응답 시간: %RESPONSE_TIME%초
echo 🧹 브라우저 정리: 완료
echo ==========================================

if "%OVERALL_RESULT%"=="PASS" (
    echo 🎉 모든 점검 항목이 정상입니다!
    echo 💡 서버가 정상적으로 동작하고 있습니다
) else (
    echo ⚠️ 일부 문제가 발견되었습니다
    echo 💡 로그를 확인하거나 서버를 재시작해보세요
)

echo.
echo 📝 상세 로그: logs\git-ultimate-server.log
echo 🔧 서버 재시작: scripts\git-ultimate-server-enhanced.sh

pause
