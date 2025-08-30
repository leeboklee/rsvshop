import subprocess
import time
import os

def kill_port(port):
    """포트를 사용하는 프로세스 종료"""
    try:
        result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if f':{port}' in line and 'LISTENING' in line:
                parts = line.split()
                if len(parts) >= 5:
                    pid = int(parts[-1])
                    subprocess.run(['taskkill', '/F', '/PID', str(pid)])
                    print(f"포트 {port}의 프로세스 {pid} 종료됨")
                    return True
    except:
        pass
    return False

def start_server():
    """서버 시작"""
    print("🚀 RSVShop 서버 시작")
    
    # 기존 프로세스 종료
    if kill_port(4900):
        time.sleep(2)
    
    # 서버 시작
    try:
        process = subprocess.Popen(
            ['cmd', '/c', 'npm', 'run', 'dev'],
            cwd=os.getcwd()
        )
        print(f"✅ 서버 시작됨 (PID: {process.pid})")
        print("🌐 http://localhost:4900")
        print("🛑 Ctrl+C로 종료")
        
        # 프로세스 대기
        process.wait()
    except KeyboardInterrupt:
        print("\n🛑 서버 종료")
        if process:
            process.terminate()

if __name__ == "__main__":
    start_server() 