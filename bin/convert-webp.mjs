#!/usr/bin/env node

/**
 * 批量将 public/ 下的 JPG/PNG 图片转为 WebP 格式
 *
 * 用法：
 *   1. 安装依赖: npm install sharp --save-dev
 *   2. 运行: npx dfgrow-convert-webp
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const MIN_SIZE = 5 * 1024; // 5KB

async function convertToWebp() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('请先安装 sharp: npm install sharp --save-dev');
    process.exit(1);
  }

  const files = readdirSync(PUBLIC_DIR).filter((f) => {
    const ext = extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });

  console.log(`找到 ${files.length} 个可转换的图片文件\n`);

  for (const file of files) {
    const src = join(PUBLIC_DIR, file);
    const size = statSync(src).size;

    if (size < MIN_SIZE) {
      console.log(`⏭ ${file} (${(size / 1024).toFixed(1)}KB < ${MIN_SIZE / 1024}KB，跳过)`);
      continue;
    }

    const destName = file.replace(/\.(jpe?g|png)$/i, '.webp');
    const dest = join(PUBLIC_DIR, destName);

    if (existsSync(dest)) {
      console.log(`⏭ ${file} → ${destName} (已存在)`);
      continue;
    }

    try {
      await sharp(src).webp({ quality: 82 }).toFile(dest);
      const newSize = statSync(dest).size;
      const savings = ((1 - newSize / size) * 100).toFixed(1);
      console.log(`✅ ${file} → ${destName} (${(size / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB, -${savings}%)`);
    } catch (err) {
      console.error(`❌ ${file} 转换失败:`, err.message);
    }
  }

  console.log('\n完成！');
}

convertToWebp();
