#!/usr/bin/env node
/**
 * RSVShop 스마트 모니터
 * 실시간 모니터링 + 에러 로깅 + 상태 표시
 */

const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

class SmartMonitor {
    constructor() {
        this.port = 4900;
        this.appUrl = 'http://localhost:4900';
        this.adminUrl = 'http://localhost:4900/admin';
        this.checkInterval = 30000; // 30초마다 체크 (실시간 모니터링)
        this.browserOpened = false;
        this.logFile = path.join(__dirname, '../logs/smart-monitor.log');
        this.isRunning = true;
        this.startTime = new Date();
        
        // 로그 디렉토리 생성
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        this.setupSignalHandlers();
        this.startMonitoring();
    }
    
    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        
        // 콘솔에 출력 (실시간 모니터링)
        console.log(logMessage);
        
        // 로그 파일에 저장
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }
    
    setupSignalHandlers() {
        process.on('SIGINT', () => {
            this.log('🛑 스마트 모니터를 종료합니다...', 'WARN');
            this.isRunning = false;
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            this.log('🛑 스마트 모니터를 종료합니다...', 'WARN');
            this.isRunning = false;
            process.exit(0);
        });
        
        process.on('uncaughtException', (error) => {
            this.log(`❌ 예상치 못한 오류: ${error.message}`, 'ERROR');
            this.log(`스택 트레이스: ${error.stack}`, 'ERROR');
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.log(`❌ 처리되지 않은 Promise 거부: ${reason}`, 'ERROR');
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
            this.log(`❌ 브라우저 열기 실패: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    getUptime() {
        const now = new Date();
        const diff = now - this.startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${hours}시간 ${minutes}분 ${seconds}초`;
    }
    
    async checkAndOpenBrowser() {
        try {
            const portInUse = await this.isPortInUse(this.port);
            
            if (portInUse) {
                if (!this.browserOpened) {
                    this.log('🚀 서버가 실행 중입니다. 브라우저를 엽니다...', 'INFO');
                    if (this.openBrowser(this.appUrl)) {
                        setTimeout(() => {
                            this.openBrowser(this.adminUrl);
                        }, 2000);
                        this.browserOpened = true;
                        this.log('✅ 브라우저가 열렸습니다!', 'SUCCESS');
                    }
                }
            } else {
                if (this.browserOpened) {
                    this.log('📴 서버가 중단되었습니다. 브라우저를 다시 열 준비 중...', 'WARN');
                    this.browserOpened = false;
                }
            }
        } catch (error) {
            this.log(`❌ 포트 체크 중 오류: ${error.message}`, 'ERROR');
        }
    }
    
    startMonitoring() {
        this.log('🛡️ RSVShop 스마트 모니터를 시작합니다...', 'INFO');
        this.log('💡 실시간 모니터링 + 에러 로깅 + 상태 표시', 'INFO');
        this.log(`📍 앱 URL: ${this.appUrl}`, 'INFO');
        this.log(`📍 관리자 URL: ${this.adminUrl}`, 'INFO');
        this.log(`⏰ 체크 주기: ${this.checkInterval/1000}초`, 'INFO');
        this.log(`🆔 프로세스 ID: ${process.pid}`, 'INFO');
        this.log(`📁 로그 파일: ${this.logFile}`, 'INFO');
        
        const monitor = async () => {
            if (!this.isRunning) return;
            
            try {
                this.log('', 'DEBUG');
                this.log(`🔍 포트 ${this.port} 상태를 확인합니다... (가동시간: ${this.getUptime()})`, 'INFO');
                await this.checkAndOpenBrowser();
                this.log(`💤 ${this.checkInterval/1000}초 후 다시 확인합니다...`, 'INFO');
                
                setTimeout(monitor, this.checkInterval);
            } catch (error) {
                this.log(`❌ 모니터링 루프 오류: ${error.message}`, 'ERROR');
                // 오류 발생 시에도 계속 모니터링
                setTimeout(monitor, this.checkInterval);
            }
        };
        
        monitor();
    }
}

// 서버 시작
new SmartMonitor(); 