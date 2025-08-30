const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backup');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async getDatabaseUrl() {
    try {
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL="([^"]+)"/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('❌ .env 파일 읽기 실패:', error.message);
      return null;
    }
  }

  async createBackup() {
    try {
      const dbUrl = await this.getDatabaseUrl();
      if (!dbUrl) {
        throw new Error('DATABASE_URL을 찾을 수 없습니다.');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
      
      console.log('🔄 PostgreSQL 백업 시작...');
      
      // PostgreSQL 백업 명령어
      const backupCommand = `pg_dump "${dbUrl}" > "${backupFile}"`;
      
      const { stdout, stderr } = await execAsync(backupCommand);
      
      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(`백업 오류: ${stderr}`);
      }
      
      console.log(`✅ 백업 완료: ${backupFile}`);
      
      // 백업 정보 저장
      const backupInfo = {
        timestamp: new Date().toISOString(),
        file: backupFile,
        size: fs.statSync(backupFile).size,
        type: 'postgresql'
      };
      
      const infoFile = path.join(this.backupDir, 'backup-info.json');
      let backupHistory = [];
      
      if (fs.existsSync(infoFile)) {
        backupHistory = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
      }
      
      backupHistory.unshift(backupInfo);
      
      // 최근 10개만 유지
      if (backupHistory.length > 10) {
        backupHistory = backupHistory.slice(0, 10);
      }
      
      fs.writeFileSync(infoFile, JSON.stringify(backupHistory, null, 2));
      
      return backupFile;
      
    } catch (error) {
      console.error('❌ 백업 실패:', error.message);
      throw error;
    }
  }

  async restoreBackup(backupFile) {
    try {
      const dbUrl = await this.getDatabaseUrl();
      if (!dbUrl) {
        throw new Error('DATABASE_URL을 찾을 수 없습니다.');
      }

      if (!fs.existsSync(backupFile)) {
        throw new Error('백업 파일을 찾을 수 없습니다.');
      }

      console.log('🔄 PostgreSQL 복구 시작...');
      
      // PostgreSQL 복구 명령어
      const restoreCommand = `psql "${dbUrl}" < "${backupFile}"`;
      
      const { stdout, stderr } = await execAsync(restoreCommand);
      
      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(`복구 오류: ${stderr}`);
      }
      
      console.log('✅ 복구 완료');
      
    } catch (error) {
      console.error('❌ 복구 실패:', error.message);
      throw error;
    }
  }

  async listBackups() {
    try {
      const infoFile = path.join(this.backupDir, 'backup-info.json');
      
      if (!fs.existsSync(infoFile)) {
        console.log('📁 백업 파일이 없습니다.');
        return [];
      }
      
      const backupHistory = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
      
      console.log('📁 백업 목록:');
      backupHistory.forEach((backup, index) => {
        const date = new Date(backup.timestamp).toLocaleString('ko-KR');
        const size = (backup.size / 1024 / 1024).toFixed(2);
        console.log(`${index + 1}. ${date} (${size} MB)`);
      });
      
      return backupHistory;
      
    } catch (error) {
      console.error('❌ 백업 목록 조회 실패:', error.message);
      return [];
    }
  }

  async autoBackup() {
    try {
      console.log('🔄 자동 백업 시작...');
      await this.createBackup();
      console.log('✅ 자동 백업 완료');
    } catch (error) {
      console.error('❌ 자동 백업 실패:', error.message);
    }
  }
}

// CLI 인터페이스
async function main() {
  const backup = new DatabaseBackup();
  const command = process.argv[2];

  switch (command) {
    case 'backup':
      await backup.createBackup();
      break;
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.log('사용법: node scripts/db-backup.js restore <backup-file>');
        return;
      }
      await backup.restoreBackup(backupFile);
      break;
    case 'list':
      await backup.listBackups();
      break;
    case 'auto':
      await backup.autoBackup();
      break;
    default:
      console.log('사용법:');
      console.log('  node scripts/db-backup.js backup    - 백업 생성');
      console.log('  node scripts/db-backup.js restore <file> - 백업 복구');
      console.log('  node scripts/db-backup.js list      - 백업 목록');
      console.log('  node scripts/db-backup.js auto      - 자동 백업');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseBackup; 