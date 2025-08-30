#!/usr/bin/env python3
"""
RSVShop 브라우저 매니저
파이썬으로 브라우저를 자동으로 열고 관리
"""

import webbrowser
import time
import threading
import subprocess
import sys
import os
from datetime import datetime

class BrowserManager:
    def __init__(self):
        self.app_url = "http://localhost:4900"
        self.admin_url = "http://localhost:4900/admin"
        self.browser_opened = False
        self.check_interval = 5  # 5초마다 체크
        self.log_file = "logs/browser-manager.log"
        self.lock_file = "logs/browser-open.lock"  # 최근 오픈 기록(중복 오픈 방지)
        # 브라우저 오픈 TTL(분). 기본 240분(4시간). 환경변수로 조정 가능
        try:
            self.open_ttl_minutes = int(os.environ.get("BROWSER_OPEN_TTL_MINUTES", "240"))
        except ValueError:
            self.open_ttl_minutes = 240
        
        # 로그 디렉토리 생성
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        
    def log(self, message):
        """로그 기록"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        
        print(log_message)
        
        # 로그 파일에 기록
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_message + "\n")

    def _now_epoch(self):
        return int(time.time())

    def has_recent_open(self, ttl_minutes=None):
        """최근에 브라우저를 연 기록이 있으면 True 반환(중복 오픈 방지)."""
        if ttl_minutes is None:
            ttl_minutes = self.open_ttl_minutes
        try:
            if os.path.exists(self.lock_file):
                with open(self.lock_file, "r", encoding="utf-8") as f:
                    ts = int((f.read() or "0").strip())
                if ts > 0:
                    age_sec = self._now_epoch() - ts
                    return age_sec < ttl_minutes * 60
        except Exception:
            pass
        return False

    def mark_opened(self):
        """브라우저 오픈 기록 남기기."""
        try:
            os.makedirs(os.path.dirname(self.lock_file), exist_ok=True)
            with open(self.lock_file, "w", encoding="utf-8") as f:
                f.write(str(self._now_epoch()))
        except Exception:
            pass

    def reset_open_marker(self):
        """오픈 기록 제거(다음에 다시 1회 오픈)."""
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
                self.log("🔁 브라우저 오픈 기록을 초기화했습니다.")
            else:
                self.log("ℹ️ 초기화할 오픈 기록이 없습니다.")
        except Exception as e:
            self.log(f"❌ 오픈 기록 초기화 실패: {e}")
    
    def is_port_in_use(self, port):
        """포트 사용 여부 확인"""
        try:
            result = subprocess.run(
                ["netstat", "-ano"], 
                capture_output=True, 
                text=True, 
                shell=True
            )
            return f":{port}" in result.stdout
        except:
            return False
    
    def open_browser(self, url):
        """브라우저 열기"""
        try:
            self.log(f"🌐 브라우저를 엽니다: {url}")
            webbrowser.open(url)
            return True
        except Exception as e:
            self.log(f"❌ 브라우저 열기 실패: {e}")
            return False
    
    def open_app_browser(self):
        """앱 브라우저 열기"""
        return self.open_browser(self.app_url)
    
    def open_admin_browser(self):
        """관리자 브라우저 열기"""
        return self.open_browser(self.admin_url)
    
    def check_and_open_browser(self):
        """포트 확인 후 브라우저 열기"""
        if self.is_port_in_use(4900):
            if not self.browser_opened:
                # 최근에 이미 열었으면 중복으로 열지 않음
                if self.has_recent_open():
                    self.log("✅ 서버 실행 중(최근 이미 브라우저를 열었으므로 새로 열지 않습니다).")
                    self.browser_opened = True  # 현재 세션에선 다시 열지 않도록 표시
                    return
                self.log("🚀 서버가 실행 중입니다. 브라우저를 한 번만 엽니다...")
                if self.open_app_browser():
                    self.browser_opened = True
                    self.mark_opened()
                    # 2초 후 관리자 페이지도 열기
                    time.sleep(2)
                    self.open_admin_browser()
        else:
            if self.browser_opened:
                self.log("📴 서버가 중단되었습니다.")
                self.browser_opened = False
    
    def start_monitoring(self):
        """브라우저 모니터링 시작"""
        self.log("🛡️ 브라우저 매니저를 시작합니다...")
        self.log(f"📍 앱 URL: {self.app_url}")
        self.log(f"📍 관리자 URL: {self.admin_url}")
        self.log("💡 서버가 시작되면 자동으로 브라우저가 열립니다.")
        self.log("💡 Ctrl+C로 종료할 수 있습니다.")
        
        try:
            while True:
                self.check_and_open_browser()
                time.sleep(self.check_interval)
        except KeyboardInterrupt:
            self.log("\n🛑 브라우저 매니저를 종료합니다...")
    
    def force_open_browser(self):
        """강제로 브라우저 열기"""
        self.log("🔧 강제로 브라우저를 엽니다...")
        self.open_app_browser()
        time.sleep(1)
        self.open_admin_browser()
    
    def show_status(self):
        """상태 확인"""
        port_status = "🔴 사용 중" if self.is_port_in_use(4900) else "🟢 사용 가능"
        browser_status = "🟢 열림" if self.browser_opened else "🔴 닫힘"
        
        self.log("📊 상태 확인:")
        self.log(f"  포트 4900: {port_status}")
        self.log(f"  브라우저: {browser_status}")
        self.log(f"  앱 URL: {self.app_url}")
        self.log(f"  관리자 URL: {self.admin_url}")

def main():
    manager = BrowserManager()
    
    if len(sys.argv) < 2:
        print("""
🌐 RSVShop 브라우저 매니저

사용법:
  python scripts/browser-manager.py start [ttl_minutes]  - 모니터링 시작(최근 열었으면 다시 열지 않음)
  python scripts/browser-manager.py open                   - 강제로 브라우저 열기(중복 방지 무시)
  python scripts/browser-manager.py status                 - 상태 확인
  python scripts/browser-manager.py reset                  - 중복 오픈 방지 기록 초기화

특징:
  ✅ 서버 시작 시 브라우저 1회만 자동 오픈(최근 열었으면 생략)
  ✅ taskkill /f /im node.exe에 영향받지 않음
  ✅ 포트 모니터링 (5초마다)
  ✅ 앱 + 관리자 페이지 자동 열기(중복 방지)
  ✅ Python 기반 (Node.js 독립적)
  ⚙️ 환경변수 BROWSER_OPEN_TTL_MINUTES로 중복 방지 TTL(분) 설정 가능(기본 240)
        """)
        return

    command = sys.argv[1]
    
    if command == "start":
        # start [ttl_minutes]
        if len(sys.argv) >= 3:
            try:
                manager.open_ttl_minutes = int(sys.argv[2])
            except ValueError:
                manager.log("⚠️ ttl_minutes 파싱 실패. 기본값을 사용합니다.")
        manager.start_monitoring()
    elif command == "open":
        manager.force_open_browser()
    elif command == "status":
        manager.show_status()
    elif command == "reset":
        manager.reset_open_marker()
    else:
        print(f"알 수 없는 명령어: {command}")

if __name__ == "__main__":
    main() 