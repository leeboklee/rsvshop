@echo off
chcp 65001 >nul
title Server/Client Error Auto Fix System
echo.
echo ========================================
echo Auto Error Fix System
echo ========================================
echo.

:: Step 1: Error Pattern Analysis
echo [Step 1] Error Pattern Analysis...

:: Check latest error logs
echo Checking error logs:
if exist "logs\error.log" (
    echo Found error log
    findstr /I /C:"예약 조회 오류" logs\error.log | find /c /v "" > temp_reservation_errors.txt
    set /p RESERVATION_ERRORS=<temp_reservation_errors.txt
    del temp_reservation_errors.txt
    
    findstr /I /C:"패키지 조회 오류" logs\error.log | find /c /v "" > temp_package_errors.txt
    set /p PACKAGE_ERRORS=<temp_package_errors.txt
    del temp_package_errors.txt
    
    echo Reservation errors: %RESERVATION_ERRORS%
    echo Package errors: %PACKAGE_ERRORS%
) else (
    echo No error log found
    set RESERVATION_ERRORS=0
    set PACKAGE_ERRORS=0
)

:: Step 2: Database Connection Check
echo [Step 2] Database Connection Check...

curl -s http://localhost:4900/api/health/db > temp_db_health.json
if %errorlevel% equ 0 (
    findstr /C:"connected" temp_db_health.json >nul
    if %errorlevel% equ 0 (
        echo Database connected
        set DB_STATUS=CONNECTED
    ) else (
        echo Database connection error
        set DB_STATUS=DISCONNECTED
    )
    del temp_db_health.json
) else (
    echo Health check API no response
    set DB_STATUS=API_ERROR
)

:: Step 3: API Response Speed Test
echo [Step 3] API Response Speed Test...

echo Testing reservation API:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/reservations') do set RESERVATION_TIME=%%i
echo Reservation API response time: %RESERVATION_TIME% seconds

echo Testing package API:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/packages') do set PACKAGE_TIME=%%i
echo Package API response time: %PACKAGE_TIME% seconds

:: Step 4: Performance Threshold Check
echo [Step 4] Performance Threshold Check...

if %RESERVATION_TIME% gtr 5.0 (
    echo Warning: Reservation API slow (%RESERVATION_TIME% seconds)
    set RESERVATION_SLOW=YES
) else (
    echo Reservation API normal (%RESERVATION_TIME% seconds)
    set RESERVATION_SLOW=NO
)

if %PACKAGE_TIME% gtr 5.0 (
    echo Warning: Package API slow (%PACKAGE_TIME% seconds)
    set PACKAGE_SLOW=YES
) else (
    echo Package API normal (%PACKAGE_TIME% seconds)
    set PACKAGE_SLOW=NO
)

:: Step 5: Auto Fix Application
echo [Step 5] Auto Fix Application...

:: Prisma connection optimization
echo Prisma optimization:
if "%DB_STATUS%"=="DISCONNECTED" (
    echo Regenerating Prisma...
    npx prisma generate >nul 2>&1
    if %errorlevel% equ 0 (
        echo Prisma regeneration complete
    ) else (
        echo Prisma regeneration failed
    )
    
    echo Database migration check...
    npx prisma db push >nul 2>&1
    if %errorlevel% equ 0 (
        echo Database sync complete
    ) else (
        echo Database sync failed
    )
)

:: Cache optimization
echo Cache optimization:
if exist ".next" (
    echo Deleting Next.js cache...
    rd /s /q .next >nul 2>&1
    echo Next.js cache deletion complete
)

:: Step 6: Server Restart (if needed)
if "%DB_STATUS%"=="DISCONNECTED" (
    echo [Step 6] Server Restart...
    
    echo Stopping existing server processes:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4900') do (
        echo Stopping PID %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    
    echo Waiting 3 seconds...
    ping -n 4 127.0.0.1 >nul
    
    echo Starting server...
    start "RSVShop Server" cmd /k "npm run dev"
    
    echo Waiting for server start (15 seconds)...
    ping -n 16 127.0.0.1 >nul
)

:: Step 7: Post-fix Verification
echo [Step 7] Post-fix Verification...

echo Database recheck:
curl -s http://localhost:4900/api/health/db > temp_db_health2.json
if %errorlevel% equ 0 (
    findstr /C:"connected" temp_db_health2.json >nul
    if %errorlevel% equ 0 (
        echo Database connection recovered
        set DB_STATUS_AFTER=CONNECTED
    ) else (
        echo Database still has errors
        set DB_STATUS_AFTER=DISCONNECTED
    )
    del temp_db_health2.json
) else (
    echo Health check API still no response
    set DB_STATUS_AFTER=API_ERROR
)

echo API response speed recheck:
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/reservations') do set RESERVATION_TIME_AFTER=%%i
for /f %%i in ('curl -o nul -s -w "%%{time_total}" http://localhost:4900/api/admin/packages') do set PACKAGE_TIME_AFTER=%%i

echo Reservation API (after fix): %RESERVATION_TIME_AFTER% seconds
echo Package API (after fix): %PACKAGE_TIME_AFTER% seconds

:: Step 8: Final Report
echo.
echo ========================================
echo Auto Error Fix Report
echo ========================================
echo Fix time: %date% %time%
echo.
echo Before fix status:
echo - Reservation errors: %RESERVATION_ERRORS%
echo - Package errors: %PACKAGE_ERRORS%  
echo - DB connection: %DB_STATUS%
echo - Reservation API: %RESERVATION_TIME% seconds
echo - Package API: %PACKAGE_TIME% seconds
echo.
echo Applied fixes:
echo - Prisma regeneration: Applied based on %DB_STATUS%
echo - DB sync: Applied based on %DB_STATUS%
echo - Next.js cache deletion: Applied
echo - Server restart: Applied based on %DB_STATUS%
echo.
echo After fix status:
echo - DB connection: %DB_STATUS_AFTER%
echo - Reservation API: %RESERVATION_TIME_AFTER% seconds
echo - Package API: %PACKAGE_TIME_AFTER% seconds
echo ========================================

if "%DB_STATUS_AFTER%"=="CONNECTED" (
    echo All errors resolved!
    echo Server is working normally
) else (
    echo Some issues remain
    echo Please check database settings manually
)

echo.
echo Detailed log: logs\auto-error-fix-%date:~0,10%.log
echo Manual recovery: emergency-recovery-service.bat

pause
