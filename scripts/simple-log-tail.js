const { spawn } = require('child_process');

// 간단한 Docker 로그 tail 스크립트
function tailDockerLogs(containerName = 'rsvshop-rsvshop-dev-1') {
  console.log(`🚀 ${containerName} 로그 스트리밍 시작...`);
  console.log('📝 Ctrl+C로 중지\n');

  const logProcess = spawn('docker', ['logs', '-f', '--tail', '20', containerName], {
    stdio: ['inherit', 'inherit', 'inherit']
  });

  // 프로세스 종료 처리
  logProcess.on('close', (code) => {
    console.log(`\n📋 로그 스트리밍 종료 (코드: ${code})`);
  });

  // 에러 처리
  logProcess.on('error', (error) => {
    console.error(`❌ 로그 스트리밍 오류: ${error.message}`);
  });

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 사용자에 의해 중지됨');
    logProcess.kill();
    process.exit(0);
  });
}

// CLI 실행
if (require.main === module) {
  const containerName = process.argv[2] || 'rsvshop-rsvshop-dev-1';
  tailDockerLogs(containerName);
}

module.exports = tailDockerLogs; 