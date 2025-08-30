#!/usr/bin/env python3
"""
RSVShop Python 서버 매니저
Node.js 프로세스를 파이썬으로 관리하여 taskkill /f /im node.exe에 대응
"""

import subprocess
import time
import signal
import sys
import os
import json
import threading
from datetime import datetime
import psutil

class PythonServerManager:
    def __init__(self):
        self.app_name = "rsvshop"
        self.port = 4900
        self.max_restarts = 10
        self.restart_delay = 3  # 3초
        self.restart_count = 0
        self.is_running = False
        self.node_process = None
        self.log_file = "logs/python-server-manager.log"
        self.config_file = "config/server-config.json"
        
        # 로그 디렉토리 생성
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
        
        # 시그널 핸들러 등록
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def log(self, message):
        """로그 기록"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        
        print(log_message)
        
        # 로그 파일에 기록
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_message + "\n")

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

    def kill_port(self, port):
        """포트 강제 해제"""
        try:
            self.log(f"포트 {port}를 사용하는 프로세스를 종료합니다...")
            subprocess.run(
                ["npx", "kill-port", str(port)], 
                capture_output=True, 
                shell=True
            )
            return True
        except Exception as e:
            self.log(f"포트 {port} 해제 실패: {e}")
            return False

    def find_available_port(self, start_port=4900, max_search=10):
        """사용 가능한 포트 찾기"""
        for port in range(start_port, start_port + max_search):
            if not self.is_port_in_use(port):
                return port
        raise Exception(f"사용 가능한 포트를 찾을 수 없습니다 ({start_port}-{start_port + max_search})")

    def start_node_server(self):
        """Node.js 서버 시작"""
        if self.is_running:
            self.log("이미 실행 중입니다.")
            return

        # 포트 확인 및 해제
        if self.is_port_in_use(self.port):
            self.kill_port(self.port)
            time.sleep(1)

        # 포트가 여전히 사용 중이면 다른 포트 찾기
        if self.is_port_in_use(self.port):
            self.port = self.find_available_port(self.port)
            self.log(f"포트를 {self.port}로 변경했습니다.")

        self.log(f"🚀 {self.app_name} Node.js 서버를 시작합니다 (포트: {self.port})")
        
        # Next.js 개발 서버 시작
        try:
            self.node_process = subprocess.Popen(
                ["npx", "next", "dev", "-p", str(self.port), "-H", "0.0.0.0"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True,
                env={**os.environ, "PORT": str(self.port), "HOSTNAME": "0.0.0.0"}
            )
            
            self.is_running = True
            self.restart_count = 0
            
            # 로그 출력 스레드
            def log_output():
                for line in self.node_process.stdout:
                    print(line.rstrip())
            
            log_thread = threading.Thread(target=log_output, daemon=True)
            log_thread.start()
            
            # 프로세스 상태 모니터링
            self.monitor_process()
            
        except Exception as e:
            self.log(f"❌ 서버 시작 실패: {e}")
            self.handle_process_exit(1)

    def monitor_process(self):
        """프로세스 상태 모니터링"""
        while self.is_running and self.node_process:
            # 프로세스가 살아있는지 확인
            if self.node_process.poll() is not None:
                exit_code = self.node_process.returncode
                self.log(f"📴 Node.js 프로세스가 종료되었습니다 (코드: {exit_code})")
                self.handle_process_exit(exit_code)
                break
            
            time.sleep(1)

    def handle_process_exit(self, code):
        """프로세스 종료 처리"""
        self.is_running = False
        self.node_process = None

        # 정상 종료인 경우 재시작하지 않음
        if code == 0:
            self.log("정상 종료되었습니다.")
            return

        # 비정상 종료 시 재시작 시도
        if self.restart_count < self.max_restarts:
            self.restart_count += 1
            self.log(f"🔄 재시작 시도 {self.restart_count}/{self.max_restarts} ({self.restart_delay}초 후)")
            
            time.sleep(self.restart_delay)
            self.start_node_server()
        else:
            self.log(f"❌ 최대 재시작 횟수 초과 ({self.max_restarts}회)")
            self.log("수동으로 서버를 시작해주세요.")

    def stop_server(self):
        """서버 중지"""
        if not self.is_running or not self.node_process:
            self.log("실행 중인 서버가 없습니다.")
            return

        self.log("🛑 서버를 중지합니다...")
        
        try:
            # 정상 종료 시도
            self.node_process.terminate()
            self.node_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            # 강제 종료
            self.log("강제 종료를 시도합니다...")
            self.node_process.kill()
        
        self.is_running = False
        self.node_process = None

    def restart_server(self):
        """서버 재시작"""
        self.log("🔄 서버를 재시작합니다...")
        self.restart_count = 0
        self.stop_server()
        time.sleep(2)
        self.start_node_server()

    def check_status(self):
        """상태 확인"""
        port_status = "🔴 사용 중" if self.is_port_in_use(self.port) else "🟢 사용 가능"
        process_status = "🟢 실행 중" if self.is_running else "🔴 중지됨"
        
        self.log("📊 상태 확인:")
        self.log(f"  포트 {self.port}: {port_status}")
        self.log(f"  프로세스: {process_status}")
        self.log(f"  재시작 횟수: {self.restart_count}/{self.max_restarts}")
        
        # 실행 중인 Node.js 프로세스 확인
        node_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['name'] == 'node.exe':
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    if 'next' in cmdline or 'rsvshop' in cmdline:
                        node_processes.append({
                            'pid': proc.info['pid'],
                            'cmdline': cmdline
                        })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        if node_processes:
            self.log(f"  실행 중인 Node.js 프로세스: {len(node_processes)}개")
            for proc in node_processes:
                self.log(f"    PID {proc['pid']}: {proc['cmdline'][:50]}...")

    def signal_handler(self, signum, frame):
        """시그널 핸들러"""
        self.log(f"\n🛑 시그널 {signum}을 받았습니다. 서버를 종료합니다...")
        self.stop_server()
        sys.exit(0)

    def start_protection(self):
        """보호 모드 시작"""
        self.log("🛡️ Python 서버 매니저 보호 모드를 시작합니다...")
        self.log("Ctrl+C로 종료할 수 있습니다.")
        self.log("💡 이 프로세스는 taskkill /f /im node.exe에 영향을 받지 않습니다!")
        
        # 서버 시작
        self.start_node_server()
        
        # 주기적 상태 확인 (1분마다)
        while True:
            time.sleep(60)
            if not self.is_running and self.restart_count < self.max_restarts:
                self.log("🔍 서버가 중단되었습니다. 재시작을 시도합니다...")
                self.restart_count = 0
                self.start_node_server()

def main():
    manager = PythonServerManager()
    
    if len(sys.argv) < 2:
        print("""
🛡️ RSVShop Python 서버 매니저

사용법:
  python scripts/python-server-manager.py start    - 보호 모드 시작
  python scripts/python-server-manager.py stop     - 서버 중지
  python scripts/python-server-manager.py restart  - 서버 재시작
  python scripts/python-server-manager.py status   - 상태 확인

특징:
  ✅ taskkill /f /im node.exe 완전 보호
  ✅ 자동 재시작 (최대 10회)
  ✅ 포트 충돌 자동 해결
  ✅ 프로세스 모니터링
  ✅ 로그 기록
  ✅ Python 기반 (Node.js 독립적)
        """)
        return

    command = sys.argv[1]
    
    if command == "start":
        manager.start_protection()
    elif command == "stop":
        manager.stop_server()
    elif command == "restart":
        manager.restart_server()
    elif command == "status":
        manager.check_status()
    else:
        print(f"알 수 없는 명령어: {command}")

if __name__ == "__main__":
    main() 