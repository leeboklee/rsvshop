import subprocess
import time
import os
import signal
import sys

class ProtectedServer:
    def __init__(self, port=4900):
        self.port = port
        self.node_process = None
        self.running = True
        
    def kill_port(self):
        """포트를 사용하는 프로세스 종료"""
        try:
            result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if f':{self.port}' in line and 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = int(parts[-1])
                        subprocess.run(['taskkill', '/F', '/PID', str(pid)])
                        print(f"포트 {self.port}의 프로세스 {pid} 종료됨")
                        return True
        except:
            pass
        return False
    
    def start_server(self):
        """Node.js 서버 시작"""
        try:
            self.node_process = subprocess.Popen(
                ['cmd', '/c', 'npm', 'run', 'dev'],
                cwd=os.getcwd(),
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP  # 프로세스 그룹 분리
            )
            print(f"✅ 보호된 서버 시작됨 (PID: {self.node_process.pid})")
            print("🛡️ Node.js 프로세스 보호 활성화")
            return True
        except Exception as e:
            print(f"서버 시작 실패: {e}")
            return False
    
    def monitor_and_restart(self):
        """서버 모니터링 및 재시작"""
        while self.running:
            if self.node_process and self.node_process.poll() is not None:
                print("🔄 서버가 종료됨. 재시작 중...")
                time.sleep(2)
                self.start_server()
            time.sleep(3)
    
    def signal_handler(self, signum, frame):
        """시그널 핸들러"""
        print("\n🛑 종료 신호 수신. 정리 중...")
        self.running = False
        if self.node_process:
            self.node_process.terminate()
        sys.exit(0)
    
    def run(self):
        """메인 실행"""
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print("🚀 보호된 RSVShop 서버 시작")
        print("🛡️ taskkill /f /im node.exe 방어 모드")
        
        # 기존 프로세스 종료
        if self.kill_port():
            time.sleep(2)
        
        # 서버 시작
        if not self.start_server():
            print("서버 시작 실패")
            return
        
        print(f"🌐 http://localhost:{self.port}")
        print("🛑 Ctrl+C로 종료")
        
        # 포그라운드 모드로 변경 (백그라운드 모니터링 제거)
        print("⚠️  백그라운드 모니터링이 비활성화되었습니다.")
        print("🚀 포그라운드에서 서버를 실행합니다...")
        
        try:
            # 포그라운드에서 서버 프로세스 대기
            self.node_process.wait()
        except KeyboardInterrupt:
            self.signal_handler(None, None)

if __name__ == "__main__":
    server = ProtectedServer(4900)
    server.run() 