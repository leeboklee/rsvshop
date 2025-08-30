const { exec } = require('child_process');

function killPort3900() {
  console.log('포트 3900에서 실행 중인 프로세스 확인 중...');
  
  // netstat으로 포트 3900 사용 프로세스 찾기
  exec('netstat -ano | findstr :3900', (error, stdout) => {
    if (error) {
      console.log('포트 3900에서 실행 중인 프로세스가 없습니다.');
      return;
    }
    
    const lines = stdout.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      console.log('포트 3900에서 실행 중인 프로세스가 없습니다.');
      return;
    }
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[4];
        console.log(`포트 3900 사용 프로세스 발견: PID ${pid}`);
        
        // 해당 PID만 종료
        exec(`taskkill /f /pid ${pid}`, (killError) => {
          if (killError) {
            console.log(`PID ${pid} 종료 실패: ${killError.message}`);
          } else {
            console.log(`PID ${pid} 성공적으로 종료됨`);
          }
        });
      }
    });
  });
}

killPort3900(); 