@echo off
:: Git Bash 무적서버 자동 시작
echo 🛡️ Git Bash 무적서버 시작...

:: Git Bash에서 무적서버 스크립트 실행
echo [1단계] Git Bash 무적서버 스크립트 실행...
start "Git Bash 무적서버" "C:\Program Files\Git\bin\bash.exe" -c "cd /c/codist/rsvshop && ./scripts/git-ultimate-server-enhanced.sh"

echo ✅ Git Bash 무적서버 시작 완료!
echo 💡 별도 터미널에서 무적서버가 실행됩니다
echo 🌐 잠시 후 http://localhost:4900/admin 에서 확인하세요

timeout /t 5
exit
