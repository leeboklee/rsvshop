import fs from 'fs';
import path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'server.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  try {
    ensureLogDir();
    const entry = {
      ts: new Date().toISOString(),
      level,
      event,
      ...((data || {}) as object)
    } as Record<string, unknown>;
    const line = JSON.stringify(entry);
    fs.appendFileSync(LOG_FILE, line + '\n', { encoding: 'utf-8' });
    // Also mirror to console
    if (level === 'error') console.error('[server]', line);
    else if (level === 'warn') console.warn('[server]', line);
    else if (level === 'info') console.info('[server]', line);
    else console.debug('[server]', line);
  } catch {}
}

export function logApiStart(method: string, url: string, meta?: Record<string, unknown>) {
  log('info', 'api:start', { method, url, ...meta });
}

export function logApiEnd(method: string, url: string, status: number, meta?: Record<string, unknown>) {
  log('info', 'api:end', { method, url, status, ...meta });
}

export function logApiError(method: string, url: string, error: unknown) {
  const err = error as any;
  log('error', 'api:error', {
    method,
    url,
    message: err?.message || String(err),
    code: err?.code,
    stack: err?.stack
  });
}

export default { log, logApiStart, logApiEnd, logApiError };


