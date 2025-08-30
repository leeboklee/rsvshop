// SVG 인라인 style 자동 변환 스크립트
// 사용법: node scripts/svg-inline-style-fix.js <input.svg> <output.svg>
const fs = require('fs');
const { JSDOM } = require('jsdom');

if (process.argv.length < 4) {
  console.log('Usage: node scripts/svg-inline-style-fix.js <input.svg> <output.svg>');
  process.exit(1);
}

const [input, output] = [process.argv[2], process.argv[3]];
const svgContent = fs.readFileSync(input, 'utf-8');
const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
const svg = dom.window.document.querySelector('svg');

if (!svg) {
  console.error('SVG 태그를 찾을 수 없음');
  process.exit(1);
}

// 기본 스타일 속성 적용
svg.setAttribute('width', svg.getAttribute('width') || '48px');
svg.setAttribute('height', svg.getAttribute('height') || '48px');
svg.setAttribute('fill', svg.getAttribute('fill') || 'currentColor');
svg.style.objectFit = 'contain';
svg.style.overflow = 'visible';
svg.style.display = 'block';

// <style> 태그 제거 및 class 속성 제거
const styleTags = dom.window.document.querySelectorAll('style');
styleTags.forEach(tag => tag.remove());
const all = dom.window.document.querySelectorAll('[class]');
all.forEach(el => el.removeAttribute('class'));

fs.writeFileSync(output, dom.serialize(), 'utf-8');
console.log(`SVG 인라인 스타일 변환 완료: ${output}`); 