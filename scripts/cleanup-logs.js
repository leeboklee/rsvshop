const fs = require('fs');
const path = require('path');

function cleanupLogs() {
  const logsDir = path.join(__dirname, '..', 'logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('Logs directory does not exist.');
    return;
  }

  const files = fs.readdirSync(logsDir);
  let deletedCount = 0;
  let totalSize = 0;

  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

    // 7일 이상 된 로그 파일 삭제
    if (daysOld > 7) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        totalSize += stats.size;
        console.log(`Deleted: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      } catch (error) {
        console.error(`Error deleting ${file}:`, error.message);
      }
    }
  });

  console.log(`\nCleanup completed:`);
  console.log(`- Files deleted: ${deletedCount}`);
  console.log(`- Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

cleanupLogs(); 