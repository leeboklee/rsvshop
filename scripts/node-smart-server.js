#!/usr/bin/env node
/**
 * RSVShop Node.js 스마트 서버
 * taskkill 대응 복구 메커니즘 포함
 */

const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

class NodeSmartServer {
    constructor() {
        this.port = 4900;
        this.appUrl = 'http://localhost:4900';
        this.adminUrl = 'http://localhost:4900/admin';
        this.checkInterval = 60000; // 1분마다 체크
        this.browserOpened = false;
        this.pidFile = path.join(__dirname, '../.smart-server.pid');
        this.isRunning = true;
        
        // PID 파일에 현재 프로세스 ID 저장
        fs.writeFileSync(this.pidFile, process.pid.toString());
        
        console.log('🛡️ RSVShop Node.js 스마트 서버를 시작합니다...');
        console.log('💡 taskkill 대응 복구 메커니즘 포함');
        console.log(`📍 앱 URL: ${this.appUrl}`);
        console.log(`📍 관리자 URL: ${this.adminUrl}`);
        console.log(`⏰ 체크 주기: ${this.checkInterval/1000}초`);
        console.log(`🆔 프로세스 ID: ${process.pid}`);
        
        this.setupSignalHandlers();
        this.startMonitoring();
    }
    
    setupSignalHandlers() {
        // 종료 시 정리
        process.on('SIGINT', () => {
            console.log('\n🛑 스마트 서버를 종료합니다...');
            this.cleanup();
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 스마트 서버를 종료합니다...');
            this.cleanup();
            process.exit(0);
        });
        
        // 예상치 못한 종료 시 복구 스크립트 실행
        process.on('exit', (code) => {
            if (code !== 0) {
                console.log('⚠️ 예상치 못한 종료. 복구 스크립트를 실행합니다...');
                this.runRecoveryScript();
            }
        });
    }
    
    isPortInUse(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.once('close', () => resolve(false));
                server.close();
            });
            server.on('error', () => resolve(true));
        });
    }
    
    openBrowser(url) {
        const platform = process.platform;
        let command;
        
        switch (platform) {
            case 'win32':
                command = `start "" "${url}"`;
                break;
            case 'darwin':
                command = `open "${url}"`;
                break;
            default:
                command = `xdg-open "${url}"`;
        }
        
        try {
            spawn(command, [], { shell: true, stdio: 'ignore' });
            return true;
        } catch (error) {
            console.error('❌ 브라우저 열기 실패:', error.message);
            return false;
        }
    }
    
    async checkAndOpenBrowser() {
        const portInUse = await this.isPortInUse(this.port);
        
        if (portInUse) {
            if (!this.browserOpened) {
                console.log('🚀 서버가 실행 중입니다. 브라우저를 엽니다...');
                if (this.openBrowser(this.appUrl)) {
                    setTimeout(() => {
                        this.openBrowser(this.adminUrl);
                    }, 2000);
                    this.browserOpened = true;
                    console.log('✅ 브라우저가 열렸습니다!');
                }
            }
        } else {
            if (this.browserOpened) {
                console.log('📴 서버가 중단되었습니다. 브라우저를 다시 열 준비 중...');
                this.browserOpened = false;
            }
        }
    }
    
    runRecoveryScript() {
        // 복구 스크립트 생성
        const recoveryScript = `
@echo off
echo 🛠️ RSVShop 복구 스크립트를 실행합니다...
echo 🔍 스마트 서버 프로세스를 확인합니다...
if exist "${this.pidFile.replace(/\\/g, '\\\\')}" (
    echo ✅ 스마트 서버가 정상 종료되었습니다.
) else (
    echo ⚠️ 스마트 서버가 비정상 종료되었습니다.
    echo 🔄 브라우저를 다시 열어주세요.
)
pause
`;
        
        const recoveryPath = path.join(__dirname, '../recovery.bat');
        fs.writeFileSync(recoveryPath, recoveryScript);
        console.log(`💾 복구 스크립트 저장: ${recoveryPath}`);
    }
    
    cleanup() {
        try {
            if (fs.existsSync(this.pidFile)) {
                fs.unlinkSync(this.pidFile);
            }
            console.log('🧹 정리 완료');
        } catch (error) {
            console.error('❌ 정리 실패:', error.message);
        }
    }
    
    startMonitoring() {
        const monitor = async () => {
            if (!this.isRunning) return;
            
            console.log('');
            console.log('🔍 포트 상태를 확인합니다...');
            await this.checkAndOpenBrowser();
            console.log(`💤 ${this.checkInterval/1000}초 후 다시 확인합니다...`);
            
            setTimeout(monitor, this.checkInterval);
        };
        
        monitor();
    }
}

// 서버 시작
new NodeSmartServer(); 