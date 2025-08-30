const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

class AutoBackupScheduler {
  constructor() {
    this.backupDir = path.join(__dirname, '../backup');
    this.ensureBackupDir();
    this.backupInterval = 60 * 60 * 1000; // 1시간마다
    this.maxBackups = 24; // 최대 24개 백업 유지
    this.maxBackupSize = 100 * 1024 * 1024; // 최대 100MB
    this.prisma = new PrismaClient();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);
    const backupInfoFile = path.join(this.backupDir, `backup-info-${timestamp}.json`);

    console.log(`[${new Date().toISOString()}] 자동 백업 시작: ${backupFile}`);

    try {
      // 모든 테이블 데이터 백업
      const backupData = {
        timestamp: new Date().toISOString(),
        users: await this.prisma.user.findMany(),
        hotels: await this.prisma.hotel.findMany(),
        rooms: await this.prisma.room.findMany(),
        packages: await this.prisma.package.findMany(),
        bookings: await this.prisma.booking.findMany({
          include: {
            room: {
              include: {
                hotel: true
              }
            }
          }
        }),
        categories: await this.prisma.category.findMany(),
        products: await this.prisma.product.findMany(),
        orders: await this.prisma.order.findMany(),
        orderItems: await this.prisma.orderItem.findMany(),
        bookingItems: await this.prisma.bookingItem.findMany(),
        inventories: await this.prisma.inventory.findMany(),
        shoppingMalls: await this.prisma.shoppingMall.findMany()
      };

      // JSON 파일로 저장
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      // 백업 정보 저장
      const backupInfo = {
        timestamp: new Date().toISOString(),
        filename: path.basename(backupFile),
        size: fs.statSync(backupFile).size,
        type: 'auto',
        description: 'Prisma 자동 백업',
        recordCounts: {
          users: backupData.users.length,
          hotels: backupData.hotels.length,
          rooms: backupData.rooms.length,
          packages: backupData.packages.length,
          bookings: backupData.bookings.length,
          categories: backupData.categories.length,
          products: backupData.products.length,
          orders: backupData.orders.length
        }
      };

      fs.writeFileSync(backupInfoFile, JSON.stringify(backupInfo, null, 2));
      console.log(`[${new Date().toISOString()}] 백업 완료: ${backupFile}`);
      console.log(`[${new Date().toISOString()}] 백업된 레코드:`, backupInfo.recordCounts);

      // 오래된 백업 정리
      this.cleanupOldBackups();

    } catch (error) {
      console.error(`[${new Date().toISOString()}] 백업 실패:`, error);
    }
  }

  cleanupOldBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.json') && file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        time: fs.statSync(path.join(this.backupDir, file)).mtime,
        size: fs.statSync(path.join(this.backupDir, file)).size
      }))
      .sort((a, b) => b.time - a.time);

    // 전체 백업 크기 계산
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    console.log(`[${new Date().toISOString()}] 현재 백업 크기: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

    // 개수 기반 정리
    if (files.length > this.maxBackups) {
      const toDelete = files.slice(this.maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        const infoFile = path.join(this.backupDir, file.name.replace('.json', '-info.json'));
        if (fs.existsSync(infoFile)) {
          fs.unlinkSync(infoFile);
        }
        console.log(`[${new Date().toISOString()}] 오래된 백업 삭제 (개수): ${file.name}`);
      });
    }

    // 용량 기반 정리 (100MB 초과 시)
    if (totalSize > this.maxBackupSize) {
      let currentSize = totalSize;
      const toDelete = [];
      
      for (let i = files.length - 1; i >= 0; i--) {
        if (currentSize <= this.maxBackupSize) break;
        
        toDelete.push(files[i]);
        currentSize -= files[i].size;
      }

      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        const infoFile = path.join(this.backupDir, file.name.replace('.json', '-info.json'));
        if (fs.existsSync(infoFile)) {
          fs.unlinkSync(infoFile);
        }
        console.log(`[${new Date().toISOString()}] 오래된 백업 삭제 (용량): ${file.name}`);
      });
    }
  }

  async restoreFromBackup(backupFile) {
    console.log(`[${new Date().toISOString()}] 복원 시작: ${backupFile}`);

    try {
      // 백업 파일 읽기
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
        console.log(`[${new Date().toISOString()}] 사용자 복원 완료: ${backupData.users.length}개`);
      }

      if (backupData.hotels) {
        await this.prisma.hotel.createMany({ data: backupData.hotels });
        console.log(`[${new Date().toISOString()}] 호텔 복원 완료: ${backupData.hotels.length}개`);
      }

      if (backupData.rooms) {
        await this.prisma.room.createMany({ data: backupData.rooms });
        console.log(`[${new Date().toISOString()}] 객실 복원 완료: ${backupData.rooms.length}개`);
      }

      if (backupData.packages) {
        await this.prisma.package.createMany({ data: backupData.packages });
        console.log(`[${new Date().toISOString()}] 패키지 복원 완료: ${backupData.packages.length}개`);
      }

      if (backupData.categories) {
        await this.prisma.category.createMany({ data: backupData.categories });
        console.log(`[${new Date().toISOString()}] 카테고리 복원 완료: ${backupData.categories.length}개`);
      }

      if (backupData.products) {
        await this.prisma.product.createMany({ data: backupData.products });
        console.log(`[${new Date().toISOString()}] 상품 복원 완료: ${backupData.products.length}개`);
      }

      if (backupData.bookings) {
        for (const booking of backupData.bookings) {
          const { room, ...bookingData } = booking;
          await this.prisma.booking.create({ data: bookingData });
        }
        console.log(`[${new Date().toISOString()}] 예약 복원 완료: ${backupData.bookings.length}개`);
      }

      console.log(`[${new Date().toISOString()}] 복원 완료: ${backupFile}`);

    } catch (error) {
      console.error(`[${new Date().toISOString()}] 복원 실패:`, error);
    }
  }

  listBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.json') && file.startsWith('backup-') && !file.includes('-info'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const infoFile = path.join(this.backupDir, file.replace('.json', '-info.json'));
        let info = {};
        
        if (fs.existsSync(infoFile)) {
          info = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
        }

        return {
          filename: file,
          size: stats.size,
          created: stats.mtime,
          info: info
        };
      })
      .sort((a, b) => b.created - a.created);

    return files;
  }

  startScheduler() {
    console.log(`[${new Date().toISOString()}] 자동 백업 스케줄러 시작 (${this.backupInterval / 1000 / 60}분 간격)`);
    
    // 즉시 첫 백업 실행
    this.createBackup();
    
    // 주기적 백업 설정
    setInterval(() => {
      this.createBackup();
    }, this.backupInterval);
  }

  // 특정 시간으로 복원
  async restoreToTime(targetTime) {
    const backups = this.listBackups();
    const targetBackup = backups.find(backup => 
      new Date(backup.created) <= new Date(targetTime)
    );

    if (targetBackup) {
      const backupPath = path.join(this.backupDir, targetBackup.filename);
      await this.restoreFromBackup(backupPath);
      return targetBackup;
    } else {
      console.error(`[${new Date().toISOString()}] ${targetTime} 시점의 백업을 찾을 수 없습니다.`);
      return null;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// CLI 명령어 처리
if (require.main === module) {
  const scheduler = new AutoBackupScheduler();
  const command = process.argv[2];

  const runCommand = async () => {
    try {
      switch (command) {
        case 'start':
          scheduler.startScheduler();
          break;
        case 'backup':
          await scheduler.createBackup();
          break;
        case 'list':
          const backups = scheduler.listBackups();
          console.log('사용 가능한 백업:');
          backups.forEach(backup => {
            console.log(`- ${backup.filename} (${backup.created.toISOString()}) - ${(backup.size / 1024).toFixed(2)}KB`);
            if (backup.info.recordCounts) {
              console.log(`  레코드: ${JSON.stringify(backup.info.recordCounts)}`);
            }
          });
          break;
        case 'restore':
          const backupFile = process.argv[3];
          if (backupFile) {
            const backupPath = path.join(scheduler.backupDir, backupFile);
            await scheduler.restoreFromBackup(backupPath);
          } else {
            console.log('사용법: node auto-backup-scheduler.js restore <backup-file>');
          }
          break;
        case 'restore-time':
          const targetTime = process.argv[3];
          if (targetTime) {
            await scheduler.restoreToTime(targetTime);
          } else {
            console.log('사용법: node auto-backup-scheduler.js restore-time <ISO-time>');
          }
          break;
        default:
          console.log(`
자동 백업 스케줄러 사용법:
  start          - 자동 백업 스케줄러 시작
  backup         - 즉시 백업 생성
  list           - 백업 목록 조회
  restore <file> - 특정 백업으로 복원
  restore-time <time> - 특정 시간으로 복원
          `);
      }
    } finally {
      await scheduler.disconnect();
    }
  };

  runCommand().catch(console.error);
}

module.exports = AutoBackupScheduler; 