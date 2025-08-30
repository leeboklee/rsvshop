@echo off
:: Git Bash 무적서버 상태 점검
echo 🛡️ Git Bash 무적서버 상태 점검...

:: Git Bash 프로세스 확인
echo [1단계] Git Bash 프로세스 확인...
tasklist | findstr bash.exe
if errorlevel 1 (
    echo ❌ Git Bash 프로세스가 실행되지 않음
) else (
    echo ✅ Git Bash 프로세스 실행 중
)

:: 포트 4900 상태 확인
echo [2단계] 포트 4900 상태 확인...
netstat -ano | findstr :4900
if errorlevel 1 (
    echo ❌ 포트 4900에서 서버 실행되지 않음
) else (
    echo ✅ 포트 4900에서 서버 실행 중
)

:: 무적서버 로그 확인
echo [3단계] 무적서버 로그 확인...
if exist "logs\git-ultimate-server.log" (
    echo ✅ 무적서버 로그 파일 존재
    echo 📋 최근 로그 (마지막 5줄):
    powershell "Get-Content logs\git-ultimate-server.log -Tail 5"
) else (
    echo ❌ 무적서버 로그 파일 없음
)

:: 서버 응답 확인
echo [4단계] 서버 응답 확인...
curl -f http://localhost:4900 >nul 2>&1
if errorlevel 1 (
    echo ❌ 서버 응답 없음
    echo 💡 무적서버 재시작이 필요할 수 있습니다
) else (
    echo ✅ 서버 정상 응답
)

:: Admin 페이지 확인
echo [5단계] Admin 페이지 확인...
curl -f http://localhost:4900/admin >nul 2>&1
if errorlevel 1 (
    echo ❌ Admin 페이지 접근 불가
) else (
    echo ✅ Admin 페이지 접근 가능
    echo 🎉 http://localhost:4900/admin 정상!
)

echo.
echo 📊 종합 상태:
echo ==================
tasklist | findstr bash.exe
netstat -ano | findstr :4900
echo.
echo 💡 무적서버 모니터링: scripts\git-server-monitor.sh
echo 💡 무적서버 재시작: scripts\git-ultimate-server-enhanced.sh
pause
