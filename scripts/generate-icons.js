// 简单的图标生成脚本
// 使用 Node.js 内置模块创建简单的 SVG 图标

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建一个简单的红色背景白色文字的 SVG
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#b91c1c" rx="28"/>
  <text x="96" y="130" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">习</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#b91c1c" rx="80"/>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="320" font-weight="bold" fill="white" text-anchor="middle">习</text>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

// 确保 public 目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 写入 SVG 文件（浏览器可以处理 SVG 图标）
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg512);

console.log('SVG icons generated successfully!');
console.log('Note: For better PWA support, convert these SVG files to PNG using an online tool or ImageMagick.');

