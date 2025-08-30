#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class DBEmergencyRecovery {
  constructor() {
    this.port = 4901; // 메인 서버와 다른 포트
    this.backupDir = path.join(process.cwd(), 'backup');
    this.server = null;
  }

  // 백업 목록 조회
  async getBackupList() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.json') && file.startsWith('backup-') && !file.includes('-info'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.mtime,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2)
        };
      })
      .sort((a, b) => b.created - a.created);

    return files;
  }

  // 백업 복원 실행
  async restoreBackup(filename) {
    return new Promise((resolve, reject) => {
      console.log(`[${new Date().toISOString()}] 백업 복원 시작: ${filename}`);
      
      const restoreProcess = spawn('node', ['scripts/auto-backup-scheduler.js', 'restore', filename], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      restoreProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      restoreProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      restoreProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`[${new Date().toISOString()}] 백업 복원 성공: ${filename}`);
          resolve({ success: true, message: '백업 복원이 완료되었습니다.', output: output.trim() });
        } else {
          console.error(`[${new Date().toISOString()}] 백업 복원 실패: ${filename}`);
          reject({ success: false, error: '백업 복원에 실패했습니다.', details: errorOutput.trim() });
        }
      });

      restoreProcess.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] 백업 복원 프로세스 오류: ${error.message}`);
        reject({ success: false, error: '백업 복원 프로세스 실행 중 오류가 발생했습니다.', details: error.message });
      });
    });
  }

  // 자동 복구 실행
  async autoRecover() {
    return new Promise((resolve, reject) => {
      console.log(`[${new Date().toISOString()}] 자동 복구 시작`);
      
      const recoverProcess = spawn('node', ['scripts/db-recovery-manager.js', 'recover'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      recoverProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      recoverProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      recoverProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`[${new Date().toISOString()}] 자동 복구 성공`);
          resolve({ success: true, message: '자동 복구가 완료되었습니다.', output: output.trim() });
        } else {
          console.error(`[${new Date().toISOString()}] 자동 복구 실패`);
          reject({ success: false, error: '자동 복구에 실패했습니다.', details: errorOutput.trim() });
        }
      });

      recoverProcess.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] 자동 복구 프로세스 오류: ${error.message}`);
        reject({ success: false, error: '자동 복구 프로세스 실행 중 오류가 발생했습니다.', details: error.message });
      });
    });
  }

  // HTML 페이지 생성
  generateHTML(backups) {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚨 DB 긴급 복원 시스템</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .content {
            padding: 30px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            color: #856404;
        }
        .warning h3 { margin-bottom: 10px; color: #d63031; }
        .backup-list {
            margin-bottom: 30px;
        }
        .backup-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .backup-info h4 { color: #495057; margin-bottom: 5px; }
        .backup-info p { color: #6c757d; font-size: 0.9em; }
        .backup-actions button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;
            transition: background 0.3s;
        }
        .backup-actions button:hover { background: #0056b3; }
        .backup-actions button.danger { background: #dc3545; }
        .backup-actions button.danger:hover { background: #c82333; }
        .auto-recover {
            background: #28a745;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1.1em;
            width: 100%;
            margin-bottom: 20px;
            transition: background 0.3s;
        }
        .auto-recover:hover { background: #218838; }
        .status {
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            display: none;
        }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .loading { display: none; text-align: center; padding: 20px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 DB 긴급 복원 시스템</h1>
            <p>메인 서버 장애 시 독립적인 DB 복원 도구</p>
        </div>
        
        <div class="content">
            <div class="warning">
                <h3>⚠️ 주의사항</h3>
                <p>이 페이지는 메인 서버(http://localhost:4900)가 장애 상태일 때만 사용하세요.</p>
                <p>복원 후에는 메인 서버를 재시작해야 합니다.</p>
            </div>

            <button class="auto-recover" onclick="autoRecover()">
                🔄 자동 복구 실행 (권장)
            </button>

            <div class="backup-list">
                <h3>📋 백업 목록</h3>
                ${backups.length > 0 ? backups.map(backup => `
                    <div class="backup-item">
                        <div class="backup-info">
                            <h4>${backup.filename}</h4>
                            <p>생성: ${backup.created.toLocaleString('ko-KR')} | 크기: ${backup.sizeMB} MB</p>
                        </div>
                        <div class="backup-actions">
                            <button onclick="restoreBackup('${backup.filename}')">복원</button>
                        </div>
                    </div>
                `).join('') : '<p>백업 파일이 없습니다.</p>'}
            </div>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>복원 중입니다...</p>
            </div>

            <div class="status" id="status"></div>
        </div>
    </div>

    <script>
        async function restoreBackup(filename) {
            if (!confirm(\`정말로 '\${filename}' 백업으로 복원하시겠습니까?\`)) {
                return;
            }

            showLoading();
            try {
                const response = await fetch('/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename })
                });
                
                const result = await response.json();
                showStatus(result.success ? 'success' : 'error', result.message || result.error);
            } catch (error) {
                showStatus('error', '복원 중 오류가 발생했습니다: ' + error.message);
            } finally {
                hideLoading();
            }
        }

        async function autoRecover() {
            if (!confirm('자동 복구를 실행하시겠습니까?')) {
                return;
            }

            showLoading();
            try {
                const response = await fetch('/auto-recover', {
                    method: 'POST'
                });
                
                const result = await response.json();
                showStatus(result.success ? 'success' : 'error', result.message || result.error);
            } catch (error) {
                showStatus('error', '자동 복구 중 오류가 발생했습니다: ' + error.message);
            } finally {
                hideLoading();
            }
        }

        function showLoading() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('status').style.display = 'none';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        function showStatus(type, message) {
            const status = document.getElementById('status');
            status.className = \`status \${type}\`;
            status.textContent = message;
            status.style.display = 'block';
        }
    </script>
</body>
</html>
    `;
  }

  // HTTP 서버 시작
  startServer() {
    this.server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      
      // CORS 헤더 설정
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        if (parsedUrl.pathname === '/') {
          // 메인 페이지
          const backups = await this.getBackupList();
          const html = this.generateHTML(backups);
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
        } else if (parsedUrl.pathname === '/restore' && req.method === 'POST') {
          // 백업 복원 API
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { filename } = JSON.parse(body);
              const result = await this.restoreBackup(filename);
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(error));
            }
          });
        } else if (parsedUrl.pathname === '/auto-recover' && req.method === 'POST') {
          // 자동 복구 API
          try {
            const result = await this.autoRecover();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error));
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      } catch (error) {
        console.error('서버 오류:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '서버 내부 오류' }));
      }
    });

    this.server.listen(this.port, () => {
      console.log(`🚨 DB 긴급 복원 시스템 시작`);
      console.log(`📍 접속 주소: http://localhost:${this.port}`);
      console.log(`⚠️  메인 서버가 장애 상태일 때만 사용하세요!`);
      console.log(`📋 백업 목록: ${this.backupDir}`);
    });
  }

  // 서버 종료
  stop() {
    if (this.server) {
      this.server.close();
      console.log('DB 긴급 복원 시스템 종료');
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const recovery = new DBEmergencyRecovery();
  
  // Ctrl+C로 종료
  process.on('SIGINT', () => {
    console.log('\n서버 종료 중...');
    recovery.stop();
    process.exit(0);
  });

  recovery.startServer();
}

module.exports = DBEmergencyRecovery; 