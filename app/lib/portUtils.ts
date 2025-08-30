import { exec } from 'child_process';
import logger from './logger';

// 포트 유틸리티 함수 모음 (Port utility functions)

/**
 * 사용 가능한 포트 찾기 (Find available port)
 * @param start 시작 포트 (start port)
 * @param end 끝 포트 (end port)
 * @returns 사용 가능한 포트 번호 (available port number)
 */
export async function findAvailablePort(start: number, end: number): Promise<number> {
  // ... existing code ...
}

/**
 * 포트가 사용 중인지 확인 (Check if port is in use)
 * @param port 포트 번호 (port number)
 * @returns 사용 여부 (true if in use)
 */
export async function isPortInUse(port: number): Promise<boolean> {
  // ... existing code ...
}

/**
 * 지정된 포트에서 실행 중인 프로세스를 찾아 종료합니다.
 * @param port 확인할 포트 번호
 * @returns 프로미스 - 성공 시 true, 실패 시 false 반환
 */
export const killPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    logger.info(`포트 ${port}에서 실행 중인 프로세스 확인 중...`);
    
    // Windows에서 포트를 사용 중인 프로세스 ID 찾기
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        logger.info(`포트 ${port}에서 실행 중인 프로세스가 없습니다.`);
        resolve(true);
        return;
      }
      
      try {
        // 출력에서 PID 추출
        const rows = stdout.trim().split('\n');
        
        // TCP 연결만 필터링
        const tcpRows = rows.filter(row => row.includes('TCP'));
        
        if (tcpRows.length === 0) {
          logger.info(`포트 ${port}에서 실행 중인 TCP 프로세스가 없습니다.`);
          resolve(true);
          return;
        }

        // 첫 번째 행에서 PID 추출 (마지막 컬럼)
        const pid = tcpRows[0].trim().split(/\s+/).pop();
        
        if (!pid) {
          logger.error('PID를 찾을 수 없습니다.');
          resolve(false);
          return;
        }

        logger.info(`포트 ${port}에서 PID ${pid} 프로세스 종료 중...`);
        
        // 프로세스 종료
        exec(`taskkill /PID ${pid} /F`, (killError, killStdout) => {
          if (killError) {
            logger.error(`프로세스 종료 중 오류: ${killError.message}`);
            resolve(false);
            return;
          }
          
          logger.info(`포트 ${port}에서 프로세스 성공적으로 종료됨: ${killStdout.trim()}`);
          resolve(true);
        });
      } catch (e) {
        logger.error(`포트 관리 중 예외 발생: ${e instanceof Error ? e.message : String(e)}`);
        resolve(false);
      }
    });
  });
};

/**
 * 앱 시작 전에 포트 확인 및 필요 시 프로세스 종료
 * @param port 확인할 포트 번호
 */
export const checkAndPreparePort = async (port: number = 3000): Promise<void> => {
  logger.info(`서버 시작 전 포트 ${port} 확인 중...`);
  await killPort(port);
}; 