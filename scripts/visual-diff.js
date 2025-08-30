const fs = require('fs');
const PNG = require('pngjs').PNG;
let pixelmatch;
try {
  pixelmatch = require('pixelmatch');
  if (typeof pixelmatch !== 'function' && pixelmatch.default) pixelmatch = pixelmatch.default;
} catch (e) {
  pixelmatch = require('pixelmatch/default');
}

if (process.argv.length < 5) {
  console.log('사용법: node scripts/visual-diff.js <base.png> <compare.png> <diff.png>');
  process.exit(1);
}

const [,, basePath, comparePath, diffPath] = process.argv;

const img1 = fs.createReadStream(basePath).pipe(new PNG()).on('parsed', doneReading);
const img2 = fs.createReadStream(comparePath).pipe(new PNG()).on('parsed', doneReading);
let filesRead = 0;

function doneReading() {
  if (++filesRead < 2) return;
  if (img1.width !== img2.width || img1.height !== img2.height) {
    console.error('이미지 크기 불일치');
    process.exit(2);
  }
  const diff = new PNG({ width: img1.width, height: img1.height });
  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
  diff.pack().pipe(fs.createWriteStream(diffPath)).on('finish', () => {
    console.log(`diff 완료: ${diffPath}, 차이 픽셀: ${numDiffPixels}`);
    process.exit(0);
  });
} 