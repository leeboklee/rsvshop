// tailwind-diagnose.js
const fs = require('fs');
const path = require('path');
const day = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = `logs/auto-fix-report-tailwind-diagnose-${day}.txt`;
let result = [];

function checkFile(file) {
  return fs.existsSync(file) ? 'OK' : 'MISSING';
}

function checkTailwindInCSS(cssPath) {
  if (!fs.existsSync(cssPath)) return 'MISSING';
  const content = fs.readFileSync(cssPath, 'utf-8');
  return content.includes('@tailwind') ? 'OK' : 'NO_TAILWIND';
}

function checkNodeModule(pkg) {
  try {
    require.resolve(pkg);
    return 'OK';
  } catch {
    return 'MISSING';
  }
}

function checkNextStaticCSS() {
  const cssDir = path.join('.next', 'static', 'css');
  if (!fs.existsSync(cssDir)) return 'MISSING';
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  return files.length > 0 ? 'OK' : 'NO_CSS';
}

function readLastLines(file, n = 20) {
  if (!fs.existsSync(file)) return '';
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  return lines.slice(-n).join('\n');
}

result.push(`# Tailwind Diagnose Report - ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
result.push(`- postcss.config.mjs: ${checkFile('postcss.config.mjs')}`);
result.push(`- tailwind.config.ts: ${checkFile('tailwind.config.ts')}`);
result.push(`- app/globals.css: ${checkFile('app/globals.css')} / @tailwind: ${checkTailwindInCSS('app/globals.css')}`);
result.push(`- node_modules/tailwindcss: ${checkNodeModule('tailwindcss')}`);
result.push(`- node_modules/autoprefixer: ${checkNodeModule('autoprefixer')}`);
result.push(`- .next/static/css: ${checkNextStaticCSS()}`);
result.push(`\n# 최근 dev 서버 로그 (logs/server.log):\n` + readLastLines('logs/server.log'));
result.push(`\n# 최근 빌드 로그 (logs/debug-all.log):\n` + readLastLines('logs/debug-all.log'));

fs.writeFileSync(logFile, result.join('\n'), 'utf-8');
console.log('Tailwind Diagnose Report saved:', logFile); 