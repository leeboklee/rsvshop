#!/usr/bin/env python3
import subprocess
import time
import signal
import sys
import os
# import psutil  # 제거 - 불필요한 의존성
from threading import Thread

class PortManager:
    def __init__(self, port=4900):
        self.port = port
        self.node_process = None
        self.running = True
        
    def find_process_on_port(self):
        """포트를 사용하는 프로세스 찾기"""
        try:
            result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if f':{self.port}' in line and 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        return int(parts[-1])
        except:
            pass
        return None
    
    def kill_process_on_port(self):
        """포트를 사용하는 프로세스 종료"""
        pid = self.find_process_on_port()
        if pid:
            try:
                subprocess.run(['taskkill', '/F', '/PID', str(pid)], check=True)
                print(f"포트 {self.port}의 프로세스 {pid} 종료됨")
                time.sleep(2)
                return True
            except:
                pass
        return False
    
    def start_node_server(self):
        """Node.js 서버 시작"""
        try:
            # Windows에서 npm 명령어 실행
            if os.name == 'nt':  # Windows
                self.node_process = subprocess.Popen(
                    ['cmd', '/c', 'npm', 'run', 'dev'],
                    cwd=os.getcwd(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            else:  # Linux/Mac
                self.node_process = subprocess.Popen(
                    ['npm', 'run', 'dev'],
                    cwd=os.getcwd(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            print(f"Node.js 서버 시작됨 (PID: {self.node_process.pid})")
            return True
        except Exception as e:
            print(f"서버 시작 실패: {e}")
            return False
    
    def monitor_server(self):
        """서버 모니터링"""
        while self.running:
            if self.node_process and self.node_process.poll() is not None:
                print("서버가 종료됨. 재시작 중...")
                self.kill_process_on_port()
                time.sleep(3)
                self.start_node_server()
            time.sleep(5)
    
    def signal_handler(self, signum, frame):
        """시그널 핸들러"""
        print("\n종료 신호 수신. 정리 중...")
        self.running = False
        if self.node_process:
            self.node_process.terminate()
        sys.exit(0)
    
    def run(self):
        """메인 실행"""
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print(f"포트 {self.port} 관리자 시작")
        
        # 기존 프로세스 종료
        if self.kill_process_on_port():
            time.sleep(3)
        
        # 서버 시작
        if not self.start_node_server():
            print("서버 시작 실패")
            return
        
        # 모니터링 시작
        monitor_thread = Thread(target=self.monitor_server)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        print(f"서버가 http://localhost:{self.port} 에서 실행 중")
        print("Ctrl+C로 종료")
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.signal_handler(None, None)

if __name__ == "__main__":
    manager = PortManager(4900)
    manager.run() 