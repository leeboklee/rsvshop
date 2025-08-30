@echo off
chcp 65001 >nul
title Simple Error Fix System
echo.
echo ========================================
echo Simple Error Fix System
echo ========================================
echo.

:: Step 1: Check current server status
echo [Step 1] Checking server status...
netstat -ano | findstr :4900 >nul
if %errorlevel% equ 0 (
    echo Server is running on port 4900
    set SERVER_STATUS=RUNNING
) else (
    echo Server is not running
    set SERVER_STATUS=STOPPED
)

:: Step 2: Test API endpoints
echo [Step 2] Testing API endpoints...

echo Testing reservation API:
curl -s -o nul -w "Reservation API: %%{time_total}s\n" http://localhost:4900/api/admin/reservations

echo Testing package API:
curl -s -o nul -w "Package API: %%{time_total}s\n" http://localhost:4900/api/admin/packages

:: Step 3: Database health check
echo [Step 3] Database health check...
curl -s http://localhost:4900/api/health/db > temp_db.json
if %errorlevel% equ 0 (
    findstr "connected" temp_db.json >nul
    if %errorlevel% equ 0 (
        echo Database is connected
        set DB_STATUS=CONNECTED
    ) else (
        echo Database connection issue
        set DB_STATUS=DISCONNECTED
    )
    del temp_db.json
) else (
    echo Cannot reach health check API
    set DB_STATUS=API_ERROR
)

:: Step 4: Apply fixes if needed
echo [Step 4] Applying fixes...

if "%DB_STATUS%"=="DISCONNECTED" (
    echo Fixing database connection...
    npx prisma generate
    npx prisma db push
)

:: Clear Next.js cache
if exist ".next" (
    echo Clearing Next.js cache...
    rd /s /q .next
    echo Cache cleared
)

:: Step 5: Restart server if needed
if "%SERVER_STATUS%"=="STOPPED" (
    echo [Step 5] Starting server...
    start "RSVShop Server" cmd /k "npm run dev"
    echo Server started
)

echo.
echo ========================================
echo Fix completed!
echo ========================================
echo Server status: %SERVER_STATUS%
echo Database status: %DB_STATUS%
echo.
echo Access URL: http://localhost:4900
echo Admin URL: http://localhost:4900/admin
echo ========================================

pause
