# PowerShell을 통한 자동 브라우저 점검 실행
Write-Host "🤖 PowerShell을 통한 자동 브라우저 점검 시작..." -ForegroundColor Green

# 현재 디렉토리를 프로젝트 루트로 설정
Set-Location "C:\codist\rsvshop"

# 배치 파일 실행
try {
    Write-Host "[실행] 자동 브라우저 점검 스크립트 실행 중..." -ForegroundColor Yellow
    & ".\scripts\auto-browser-test.bat"
    Write-Host "✅ 자동 브라우저 점검 완료!" -ForegroundColor Green
} catch {
    Write-Host "❌ 실행 중 오류 발생: $_" -ForegroundColor Red
    Write-Host "💡 수동으로 scripts\auto-browser-test.bat 실행해주세요" -ForegroundColor Yellow
}

Read-Host "Press Enter to continue..."
