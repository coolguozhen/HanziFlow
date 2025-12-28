// 使用 sharp 生成 PNG 图标
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// 创建 SVG 模板函数
function createSVG(size) {
  const radius = size * 0.15;
  const fontSize = size * 0.6;
  const textY = size * 0.65;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#b91c1c" rx="${radius}"/>
  <text x="${size / 2}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">习</text>
</svg>`;
}

async function generatePNG(size) {
  const svg = createSVG(size);
  const outputPath = path.join(publicDir, `icon-${size}.png`);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Generated icon-${size}.png`);
}

async function main() {
  console.log('Generating PNG icons...');
  await generatePNG(192);
  await generatePNG(512);
  console.log('All icons generated successfully!');
}

main().catch(console.error);

