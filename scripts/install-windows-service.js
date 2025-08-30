#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class WindowsServiceInstaller {
  constructor() {
    this.serviceName = 'RSVShopEmergencyRecovery';
    this.serviceDisplayName = 'RSVShop Emergency Recovery Service';
    this.serviceDescription = 'DB 긴급 복원 시스템 - Cursor IDE 종료 시에도 독립 실행';
    this.scriptPath = path.join(process.cwd(), 'scripts', 'db-emergency-recovery.js');
    this.nodePath = process.execPath;
  }

  // 서비스 설치
  async installService() {
    console.log('🚀 Windows 서비스 설치 시작...');
    
    const scCommand = `sc create "${this.serviceName}" binPath= "${this.nodePath} ${this.scriptPath}" start= auto DisplayName= "${this.serviceDisplayName}"`;
    
    try {
      await this.executeCommand(scCommand);
      
      // 서비스 설명 설정
      const descriptionCommand = `sc description "${this.serviceName}" "${this.serviceDescription}"`;
      await this.executeCommand(descriptionCommand);
      
      console.log('✅ 서비스 설치 완료!');
      console.log(`📋 서비스 이름: ${this.serviceName}`);
      console.log(`🌐 접속 주소: http://localhost:4901`);
      console.log('🔄 서비스 시작 중...');
      
      // 서비스 시작
      await this.startService();
      
    } catch (error) {
      console.error('❌ 서비스 설치 실패:', error.message);
      console.log('💡 관리자 권한으로 실행해주세요!');
    }
  }

  // 서비스 제거
  async uninstallService() {
    console.log('🗑️ Windows 서비스 제거 시작...');
    
    try {
      // 서비스 중지
      await this.stopService();
      
      // 서비스 삭제
      const deleteCommand = `sc delete "${this.serviceName}"`;
      await this.executeCommand(deleteCommand);
      
      console.log('✅ 서비스 제거 완료!');
      
    } catch (error) {
      console.error('❌ 서비스 제거 실패:', error.message);
    }
  }

  // 서비스 시작
  async startService() {
    const startCommand = `sc start "${this.serviceName}"`;
    await this.executeCommand(startCommand);
    console.log('✅ 서비스 시작 완료!');
  }

  // 서비스 중지
  async stopService() {
    const stopCommand = `sc stop "${this.serviceName}"`;
    await this.executeCommand(stopCommand);
    console.log('✅ 서비스 중지 완료!');
  }

  // 서비스 상태 확인
  async checkServiceStatus() {
    const statusCommand = `sc query "${this.serviceName}"`;
    await this.executeCommand(statusCommand);
  }

  // 명령어 실행
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      const process = spawn('cmd', ['/c', command], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(output);
          resolve(output);
        } else {
          console.error(errorOutput);
          reject(new Error(errorOutput));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// CLI 인터페이스
if (require.main === module) {
  const installer = new WindowsServiceInstaller();
  const command = process.argv[2];

  switch (command) {
    case 'install':
      installer.installService();
      break;
    case 'uninstall':
      installer.uninstallService();
      break;
    case 'start':
      installer.startService();
      break;
    case 'stop':
      installer.stopService();
      break;
    case 'status':
      installer.checkServiceStatus();
      break;
    default:
      console.log('📋 사용법:');
      console.log('  node scripts/install-windows-service.js install    - 서비스 설치');
      console.log('  node scripts/install-windows-service.js uninstall  - 서비스 제거');
      console.log('  node scripts/install-windows-service.js start      - 서비스 시작');
      console.log('  node scripts/install-windows-service.js stop       - 서비스 중지');
      console.log('  node scripts/install-windows-service.js status     - 서비스 상태 확인');
      console.log('');
      console.log('⚠️  설치/제거 시 관리자 권한이 필요합니다!');
  }
}

module.exports = WindowsServiceInstaller; 