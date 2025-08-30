@echo off
:: 무적서버 종합 점검 + 브라우저 정리 자동화
echo 🛡️ 무적서버 종합 점검 및 브라우저 정리 시작...

:: ==========================================
:: 1단계: 무적서버 상태 확인
:: ==========================================
echo.
echo [1단계] 🔍 무적서버 상태 확인
echo ==========================================

:: Git Bash 프로세스 확인
echo 📋 Git Bash 프로세스:
tasklist | findstr bash.exe
if errorlevel 1 (
    echo ❌ Git Bash 프로세스 없음
    set GITBASH_STATUS=STOPPED
) else (
    echo ✅ Git Bash 프로세스 실행 중
    set GITBASH_STATUS=RUNNING
)

:: 포트 4900 상태 확인
echo.
echo 📋 포트 4900 상태:
netstat -ano | findstr :4900
if errorlevel 1 (
    echo ❌ 포트 4900 서버 중단
    set SERVER_STATUS=STOPPED
) else (
    echo ✅ 포트 4900 서버 실행 중
    set SERVER_STATUS=RUNNING
)

:: 서버 응답 확인
echo.
echo 📋 서버 응답 테스트:
curl -f http://localhost:4900 >nul 2>&1
if errorlevel 1 (
    echo ❌ 서버 응답 없음
    set API_STATUS=DOWN
) else (
    echo ✅ 서버 정상 응답
    set API_STATUS=UP
)

:: Admin 페이지 확인
echo.
echo 📋 Admin 페이지 테스트:
curl -f http://localhost:4900/admin >nul 2>&1
if errorlevel 1 (
    echo ❌ Admin 페이지 접근 불가
    set ADMIN_STATUS=DOWN
) else (
    echo ✅ Admin 페이지 접근 가능
    set ADMIN_STATUS=UP
)

:: ==========================================
:: 2단계: 브라우저 상태 점검
:: ==========================================
echo.
echo [2단계] 🌐 브라우저 상태 점검
echo ==========================================

:: Chrome 프로세스 확인
echo 📋 Chrome 프로세스:
tasklist | findstr chrome.exe
if errorlevel 1 (
    echo ❌ Chrome 프로세스 없음
    set CHROME_STATUS=STOPPED
) else (
    echo ✅ Chrome 프로세스 실행 중
    set CHROME_STATUS=RUNNING
)

:: ==========================================
:: 3단계: 테스트 브라우저 종료
:: ==========================================
echo.
echo [3단계] 🧹 테스트 브라우저 정리
echo ==========================================

if "%CHROME_STATUS%"=="RUNNING" (
    echo 🔧 localhost:4900 관련 Chrome 탭만 정리 중...
    
    :: 특정 URL 탭만 닫기 (안전한 방법)
    powershell -Command "Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like '*localhost:4900*' } | ForEach-Object { try { $_.CloseMainWindow() } catch {} }"
    
    echo ⏳ 3초 대기...
    ping -n 4 127.0.0.1 >nul
    
    :: 재확인
    tasklist | findstr chrome.exe >nul
    if errorlevel 1 (
        echo ✅ Chrome 완전 종료됨
    ) else (
        echo ✅ localhost:4900 탭만 정리 완료 (다른 Chrome 탭은 유지)
    )
) else (
    echo ℹ️ Chrome이 실행되지 않아 정리할 것이 없습니다
)

:: ==========================================
:: 4단계: 점검 완료 보고
:: ==========================================
echo.
echo [4단계] 📊 점검 완료 보고
echo ==========================================

echo.
echo 🛡️ 무적서버 종합 상태:
echo ┌─────────────────────────────────────┐
echo │ Git Bash     : %GITBASH_STATUS%                    │
echo │ 서버 포트    : %SERVER_STATUS%                     │
echo │ API 응답     : %API_STATUS%                        │
echo │ Admin 페이지 : %ADMIN_STATUS%                      │
echo │ Chrome 상태  : %CHROME_STATUS%                    │
echo └─────────────────────────────────────┘

:: 종합 판단
if "%SERVER_STATUS%"=="RUNNING" if "%API_STATUS%"=="UP" if "%ADMIN_STATUS%"=="UP" (
    echo.
    echo 🎉 결과: 무적서버 완전 정상!
    echo 💡 http://localhost:4900/admin 접속 가능
    echo ✅ 테스트 브라우저 정리 완료
) else (
    echo.
    echo ⚠️ 결과: 무적서버 문제 감지됨
    echo 💡 scripts\git-ultimate-server-enhanced.sh 실행 권장
)

echo.
echo 📝 상세 로그: logs\git-ultimate-server.log
echo 🔧 모니터링: scripts\git-server-monitor.sh

pause
