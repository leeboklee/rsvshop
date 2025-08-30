# RSVShop 파워쉘 무적 브라우저 매니저
# 파워쉘 기반 (taskkill 완전 보호)

Write-Host "🛡️ RSVShop 파워쉘 무적 브라우저 매니저를 시작합니다..." -ForegroundColor Green
Write-Host "💡 이 스크립트는 taskkill /f /im node.exe에도 영향받지 않습니다!" -ForegroundColor Yellow

$PORT = 4900
$APP_URL = "http://localhost:4900"
$ADMIN_URL = "http://localhost:4900/admin"
$CHECK_INTERVAL = 5
$BROWSER_OPENED = $false

function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

function Open-Browser {
    param([string]$Url)
    try {
        Write-Host "🌐 브라우저를 엽니다: $Url" -ForegroundColor Cyan
        Start-Process $Url
        return $true
    }
    catch {
        Write-Host "❌ 브라우저 열기 실패: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "📍 앱 URL: $APP_URL" -ForegroundColor White
Write-Host "📍 관리자 URL: $ADMIN_URL" -ForegroundColor White
Write-Host "💡 서버가 시작되면 자동으로 브라우저가 열립니다." -ForegroundColor Yellow
Write-Host "💡 Ctrl+C로 종료할 수 있습니다." -ForegroundColor Yellow

try {
    while ($true) {
        Write-Host ""
        Write-Host "🔍 포트 $PORT 상태를 확인합니다..." -ForegroundColor Gray
        
        if (Test-PortInUse -Port $PORT) {
            if (-not $BROWSER_OPENED) {
                Write-Host "🚀 서버가 실행 중입니다. 브라우저를 엽니다..." -ForegroundColor Green
                
                if (Open-Browser -Url $APP_URL) {
                    Start-Sleep -Seconds 2
                    Open-Browser -Url $ADMIN_URL
                    $BROWSER_OPENED = $true
                    Write-Host "✅ 브라우저가 열렸습니다!" -ForegroundColor Green
                }
            }
        }
        else {
            if ($BROWSER_OPENED) {
                Write-Host "📴 서버가 중단되었습니다." -ForegroundColor Red
                $BROWSER_OPENED = $false
            }
        }
        
        Write-Host "💤 $CHECK_INTERVAL초 후 다시 확인합니다..." -ForegroundColor Gray
        Start-Sleep -Seconds $CHECK_INTERVAL
    }
}
catch {
    Write-Host ""
    Write-Host "🛑 파워쉘 무적 브라우저 매니저를 종료합니다..." -ForegroundColor Yellow
} 