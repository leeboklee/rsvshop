const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

class DBRecoveryManager {
  constructor() {
    this.prisma = new PrismaClient();
    this.backupDir = path.join(__dirname, '../backup');
    this.recoveryLogPath = path.join(__dirname, '../logs', 'db-recovery.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.recoveryLogPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(this.recoveryLogPath, logMessage);
  }

  async checkDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.log('데이터베이스 연결 정상');
      return true;
    } catch (error) {
      this.log(`데이터베이스 연결 실패: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async checkDataIntegrity() {
    try {
      // 주요 테이블 데이터 확인
      const userCount = await this.prisma.user.count();
      const hotelCount = await this.prisma.hotel.count();
      const roomCount = await this.prisma.room.count();
      const bookingCount = await this.prisma.booking.count();

      this.log(`데이터 무결성 확인: 사용자 ${userCount}명, 호텔 ${hotelCount}개, 객실 ${roomCount}개, 예약 ${bookingCount}개`);

      // 최소 데이터 확인
      if (userCount === 0 || hotelCount === 0 || roomCount === 0) {
        this.log('최소 데이터가 없습니다. 복구가 필요합니다.', 'WARN');
        return false;
      }

      return true;
    } catch (error) {
      this.log(`데이터 무결성 확인 실패: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async getLatestBackup() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.json') && file.startsWith('backup-') && !file.includes('-info'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      return files.length > 0 ? files[0] : null;
    } catch (error) {
      this.log(`백업 파일 조회 실패: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async restoreFromBackup(backupFile) {
    this.log(`백업에서 복구 시작: ${backupFile}`);
    
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

      // 기존 데이터 삭제
      await this.prisma.orderItem.deleteMany();
      await this.prisma.order.deleteMany();
      await this.prisma.product.deleteMany();
      await this.prisma.category.deleteMany();
      await this.prisma.bookingItem.deleteMany();
      await this.prisma.booking.deleteMany();
      await this.prisma.inventory.deleteMany();
      await this.prisma.package.deleteMany();
      await this.prisma.room.deleteMany();
      await this.prisma.user.deleteMany();
      await this.prisma.shoppingMall.deleteMany();

      // 데이터 복원
      if (backupData.users) {
        await this.prisma.user.createMany({ data: backupData.users });
        this.log(`사용자 복원 완료: ${backupData.users.length}개`);
      }

      if (backupData.hotels) {
        await this.prisma.hotel.createMany({ data: backupData.hotels });
        this.log(`호텔 복원 완료: ${backupData.hotels.length}개`);
      }

      if (backupData.rooms) {
        await this.prisma.room.createMany({ data: backupData.rooms });
        this.log(`객실 복원 완료: ${backupData.rooms.length}개`);
      }

      if (backupData.packages) {
        await this.prisma.package.createMany({ data: backupData.packages });
        this.log(`패키지 복원 완료: ${backupData.packages.length}개`);
      }

      if (backupData.categories) {
        await this.prisma.category.createMany({ data: backupData.categories });
        this.log(`카테고리 복원 완료: ${backupData.categories.length}개`);
      }

      if (backupData.products) {
        await this.prisma.product.createMany({ data: backupData.products });
        this.log(`상품 복원 완료: ${backupData.products.length}개`);
      }

      if (backupData.bookings) {
        for (const booking of backupData.bookings) {
          const { room, ...bookingData } = booking;
          await this.prisma.booking.create({ data: bookingData });
        }
        this.log(`예약 복원 완료: ${backupData.bookings.length}개`);
      }

      this.log('백업 복구 완료');
      return true;

    } catch (error) {
      this.log(`백업 복구 실패: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runSeedData() {
    this.log('시드 데이터 실행 시작');
    
    try {
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('npx tsx prisma/seed.ts', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
          if (error) {
            this.log(`시드 데이터 실행 실패: ${error.message}`, 'ERROR');
            reject(error);
          } else {
            this.log('시드 데이터 실행 완료');
            resolve(stdout);
          }
        });
      });
      return true;
    } catch (error) {
      this.log(`시드 데이터 실행 실패: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async autoRecovery() {
    this.log('자동 복구 프로세스 시작');

    // 1. DB 연결 확인
    const dbHealthy = await this.checkDatabaseHealth();
    if (!dbHealthy) {
      this.log('데이터베이스 연결 실패. 복구를 시도합니다.', 'WARN');
      
      // DB 재시작 시도
      try {
        await this.restartPostgreSQL();
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
        
        const dbHealthyAfterRestart = await this.checkDatabaseHealth();
        if (!dbHealthyAfterRestart) {
          this.log('데이터베이스 재시작 후에도 연결 실패', 'ERROR');
          return false;
        }
      } catch (error) {
        this.log(`데이터베이스 재시작 실패: ${error.message}`, 'ERROR');
        return false;
      }
    }

    // 2. 데이터 무결성 확인
    const dataIntegrity = await this.checkDataIntegrity();
    if (!dataIntegrity) {
      this.log('데이터 무결성 문제 발견. 백업에서 복구를 시도합니다.', 'WARN');
      
      // 최신 백업 찾기
      const latestBackup = await this.getLatestBackup();
      if (latestBackup) {
        const restoreSuccess = await this.restoreFromBackup(latestBackup.path);
        if (!restoreSuccess) {
          this.log('백업 복구 실패. 시드 데이터를 실행합니다.', 'WARN');
          await this.runSeedData();
        }
      } else {
        this.log('백업 파일이 없습니다. 시드 데이터를 실행합니다.', 'WARN');
        await this.runSeedData();
      }
    }

    // 3. 최종 확인
    const finalCheck = await this.checkDataIntegrity();
    if (finalCheck) {
      this.log('자동 복구 완료 - 데이터베이스가 정상 상태입니다.');
      return true;
    } else {
      this.log('자동 복구 실패 - 수동 개입이 필요합니다.', 'ERROR');
      return false;
    }
  }

  async restartPostgreSQL() {
    this.log('PostgreSQL 재시작 시도');
    
    return new Promise((resolve, reject) => {
      exec('net stop postgresql-x64-17 && net start postgresql-x64-17', (error, stdout, stderr) => {
        if (error) {
          this.log(`PostgreSQL 재시작 실패: ${error.message}`, 'ERROR');
          reject(error);
        } else {
          this.log('PostgreSQL 재시작 완료');
          resolve(stdout);
        }
      });
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// CLI 명령어 처리
if (require.main === module) {
  const recoveryManager = new DBRecoveryManager();
  const command = process.argv[2];

  const runCommand = async () => {
    try {
      switch (command) {
        case 'check':
          const dbHealthy = await recoveryManager.checkDatabaseHealth();
          const dataIntegrity = await recoveryManager.checkDataIntegrity();
          console.log(`DB 연결: ${dbHealthy ? '정상' : '실패'}`);
          console.log(`데이터 무결성: ${dataIntegrity ? '정상' : '문제'}`);
          break;
        case 'recover':
          await recoveryManager.autoRecovery();
          break;
        case 'restore':
          const backupFile = process.argv[3];
          if (backupFile) {
            const backupPath = path.join(recoveryManager.backupDir, backupFile);
            await recoveryManager.restoreFromBackup(backupPath);
          } else {
            console.log('사용법: node db-recovery-manager.js restore <backup-file>');
          }
          break;
        case 'seed':
          await recoveryManager.runSeedData();
          break;
        default:
          console.log(`
DB 복구 관리자 사용법:
  check           - 데이터베이스 상태 확인
  recover         - 자동 복구 실행
  restore <file>  - 특정 백업에서 복구
  seed            - 시드 데이터 실행
          `);
      }
    } finally {
      await recoveryManager.disconnect();
    }
  };

  runCommand().catch(console.error);
}

module.exports = DBRecoveryManager; 