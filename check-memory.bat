@echo off
echo ========================================
echo Windows 메모리 상태 확인
echo ========================================
echo.

echo 전체 물리 메모리:
wmic computersystem get TotalPhysicalMemory /format:value
echo.

echo 사용 가능한 메모리:
wmic OS get FreePhysicalMemory /format:value
echo.

echo 메모리 사용량이 많은 프로세스 (상위 10개):
tasklist /fi "memusage gt 100" /fo table
echo.

echo 메모리 사용량이 많은 프로세스 (상위 10개):
powershell "Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 ProcessName, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet/1MB,2)}} | Format-Table"
echo.

pause
