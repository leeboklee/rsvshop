#!/usr/bin/env python3
# 빠른 브라우저 테스트 - 열기/확인/닫기
import subprocess
import time
import requests
import sys
import os

print("🤖 빠른 브라우저 테스트 시작...")

def check_server():
    """서버 상태 확인"""
    try:
        response = requests.get("http://localhost:4900", timeout=5)
        return response.status_code == 200
    except:
        return False

def check_admin_page():
    """Admin 페이지 확인"""
    try:
        response = requests.get("http://localhost:4900/admin", timeout=5)
        return response.status_code == 200
    except:
        return False

def open_browser():
    """브라우저 열기"""
    try:
        # Chrome에서 admin 페이지 열기
        subprocess.Popen([
            "chrome", 
            "--new-window", 
            "--app=http://localhost:4900/admin"
        ], shell=True)
        print("✅ 브라우저 열기 완료")
        return True
    except Exception as e:
        print(f"❌ 브라우저 열기 실패: {e}")
        return False

def close_test_browser():
    """테스트용 브라우저 닫기"""
    try:
        # localhost:4900 관련 Chrome 프로세스만 종료
        subprocess.run([
            "powershell", "-Command",
            'Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*localhost:4900*" -or $_.MainWindowTitle -like "*admin*" } | ForEach-Object { try { $_.CloseMainWindow() } catch {} }'
        ], shell=True, capture_output=True)
        print("✅ 테스트 브라우저 닫기 완료")
        return True
    except Exception as e:
        print(f"❌ 브라우저 닫기 실패: {e}")
        return False

def main():
    print("\n[1단계] 🔍 서버 상태 확인")
    if not check_server():
        print("❌ 서버가 실행되지 않았습니다")
        print("💡 먼저 무적서버를 시작하세요")
        return False
    print("✅ 서버 실행 중")
    
    print("\n[2단계] 🌐 브라우저 열기")
    if not open_browser():
        return False
    
    print("\n[3단계] ⏳ 페이지 로딩 대기 (5초)")
    time.sleep(5)
    
    print("\n[4단계] 🔍 Admin 페이지 확인")
    if check_admin_page():
        print("✅ Admin 페이지 접근 성공")
        admin_status = "성공"
    else:
        print("❌ Admin 페이지 접근 실패")
        admin_status = "실패"
    
    print("\n[5단계] ⏳ 확인 완료 대기 (3초)")
    time.sleep(3)
    
    print("\n[6단계] 🧹 테스트 브라우저 닫기")
    close_test_browser()
    
    print("\n🎉 브라우저 테스트 완료!")
    print("="*40)
    print(f"📅 테스트 시간: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 대상 URL: http://localhost:4900/admin")
    print(f"🔍 Admin 페이지: {admin_status}")
    print(f"🧹 브라우저 정리: 완료")
    print("="*40)
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ 사용자에 의해 중단됨")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
