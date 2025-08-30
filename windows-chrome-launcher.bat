@echo off
echo ========================================
echo Windows 크롬 브라우저 실행기
echo ========================================
echo.

echo [1] 크롬 프로세스 확인:
tasklist /fi "imagename eq chrome.exe" /fo table
echo.

echo [2] 크롬 실행:
start chrome.exe --new-window --disable-gpu --disable-software-rasterizer --disable-dev-shm-usage
echo.

echo [3] 메모리 사용량 확인:
powershell "Get-Process chrome -ErrorAction SilentlyContinue | Select-Object ProcessName, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet/1MB,2)}} | Format-Table"
echo.

pause
