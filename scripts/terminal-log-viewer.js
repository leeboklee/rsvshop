const { spawn } = require('child_process');
const readline = require('readline');

class TerminalLogViewer {
  constructor() {
    this.containerId = 'rsvshop-rsvshop-dev-1';
    this.isRunning = false;
    this.logProcess = null;
  }

  // 컨테이너 목록 조회
  async listContainers() {
    try {
      const { stdout } = await this.execCommand('docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"');
      console.log('\n📋 실행 중인 컨테이너:');
      console.log(stdout);
      return stdout;
    } catch (error) {
      console.error('❌ 컨테이너 목록 조회 실패:', error.message);
      return null;
    }
  }

  // 명령어 실행 헬퍼
  execCommand(command) {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    return execAsync(command);
  }

  // 로그 스트리밍 시작
  startLogStream(containerId = this.containerId) {
    if (this.isRunning) {
      console.log('⚠️ 이미 로그 스트리밍이 실행 중입니다.');
      return;
    }

    console.log(`🚀 ${containerId} 로그 스트리밍 시작...`);
    console.log('📝 Ctrl+C로 중지할 수 있습니다.\n');

    this.isRunning = true;
    this.logProcess = spawn('docker', ['logs', '-f', '--tail', '50', containerId], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    // 타임스탬프 추가
    const addTimestamp = (data) => {
      const timestamp = new Date().toLocaleTimeString('ko-KR');
      return `[${timestamp}] ${data}`;
    };

    // stdout 처리
    this.logProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`📄 ${addTimestamp(line)}`);
      });
    });

    // stderr 처리
    this.logProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`❌ ${addTimestamp(line)}`);
      });
    });

    // 프로세스 종료 처리
    this.logProcess.on('close', (code) => {
      console.log(`\n📋 로그 스트리밍 종료 (코드: ${code})`);
      this.isRunning = false;
    });

    // 에러 처리
    this.logProcess.on('error', (error) => {
      console.error(`❌ 로그 스트리밍 오류: ${error.message}`);
      this.isRunning = false;
    });
  }

  // 로그 스트리밍 중지
  stopLogStream() {
    if (this.logProcess && this.isRunning) {
      this.logProcess.kill();
      this.isRunning = false;
      console.log('🛑 로그 스트리밍 중지됨');
    }
  }

  // 대화형 모드
  async interactiveMode() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🔧 터미널 로그 뷰어 - 대화형 모드');
    console.log('명령어:');
    console.log('  list    - 컨테이너 목록 조회');
    console.log('  start   - 로그 스트리밍 시작');
    console.log('  stop    - 로그 스트리밍 중지');
    console.log('  status  - 현재 상태 확인');
    console.log('  quit    - 종료\n');

    const askQuestion = () => {
      rl.question('명령어 입력: ', async (answer) => {
        const command = answer.trim().toLowerCase();
        
        switch (command) {
          case 'list':
            await this.listContainers();
            break;
          case 'start':
            this.startLogStream();
            break;
          case 'stop':
            this.stopLogStream();
            break;
          case 'status':
            console.log(`현재 상태: ${this.isRunning ? '실행 중' : '중지됨'}`);
            break;
          case 'quit':
            this.stopLogStream();
            rl.close();
            process.exit(0);
            break;
          default:
            console.log('❌ 알 수 없는 명령어입니다.');
        }
        
        askQuestion();
      });
    };

    askQuestion();
  }

  // 자동 시작 모드
  async autoStart() {
    console.log('🚀 자동 로그 스트리밍 시작...');
    
    // 컨테이너 상태 확인
    try {
      await this.execCommand(`docker ps --filter "name=${this.containerId}" --format "{{.ID}}"`);
      this.startLogStream();
    } catch (error) {
      console.error(`❌ 컨테이너 ${this.containerId}를 찾을 수 없습니다.`);
      console.log('📋 사용 가능한 컨테이너:');
      await this.listContainers();
    }
  }
}

// CLI 인터페이스
async function main() {
  const viewer = new TerminalLogViewer();
  const args = process.argv.slice(2);

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 사용자에 의해 중지됨');
    viewer.stopLogStream();
    process.exit(0);
  });

  if (args.includes('--interactive') || args.includes('-i')) {
    await viewer.interactiveMode();
  } else if (args.includes('--list') || args.includes('-l')) {
    await viewer.listContainers();
  } else {
    await viewer.autoStart();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TerminalLogViewer; 