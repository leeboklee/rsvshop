// 간단한 console 기반 logger
const logger = {
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  info: (message: string, meta?: any) => {
    console.info(`[INFO] ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta);
  }
};

// 일부 모듈이 default import를 사용하므로 호환성을 위해 default export도 제공
export default logger;
export { logger };