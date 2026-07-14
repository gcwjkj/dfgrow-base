#!/usr/bin/env node

/**
 * 构建后主动推送 sitemap 到百度、IndexNow(Bing/Yandex)、360、搜狗、头条搜索
 *
 * 用法：
 *   npx dfgrow-push-sitemap --site=example.com
 *   或设置环境变量：SITE_DOMAIN=example.com
 *
 * 前提环境变量（在 .env 或 CI 中配置）：
 *   SITE_DOMAIN               — 站点域名（默认 dfgrow.com）
 *   BAIDU_API_TOKEN           — 百度站长平台 API Token
 *   INDEXNOW_KEY              — IndexNow 密钥
 *   360_EMAIL / 360_PASSWORD  — 360 站长平台
 *   SOGOU_TOKEN               — 搜狗站长平台 Token
 *   TOUTIAO_TOKEN             — 头条搜索站长平台 Token
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 从命令行参数或环境变量获取站点域名
function getSiteDomain() {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--site=')) return arg.slice(7);
  }
  return process.env.SITE_DOMAIN || 'dfgrow.com';
}

const SITE_HOST = getSiteDomain();
const SITE_URL = `https://${SITE_HOST}`;
const SITEMAP_URL = `https://${SITE_HOST}/sitemap.xml`;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// ── 简易 sitemap XML 解析 ───────────────────────────────
function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

// ── 获取所有页面 URL ──────────────────────────────────
async function getPageUrls() {
  const indexPath = path.join(DIST_DIR, 'sitemap.xml');
  if (!fs.existsSync(indexPath)) {
    console.log('[sitemap] sitemap.xml 未找到，跳过 URL 提取');
    return [];
  }

  const indexXml = fs.readFileSync(indexPath, 'utf8');
  const sitemapUrls = parseSitemapUrls(indexXml);

  const allUrls = [];
  for (const sitemapUrl of sitemapUrls) {
    const basename = sitemapUrl.split('/').pop();
    const localPath = path.join(DIST_DIR, basename);
    if (!fs.existsSync(localPath)) continue;
    const xml = fs.readFileSync(localPath, 'utf8');
    const pageUrls = parseSitemapUrls(xml);
    allUrls.push(...pageUrls);
  }
  return allUrls;
}

// ── 生成 IndexNow key 文件 ────────────────────────────
function generateIndexNowKeyFile() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return;

  const publicDir = path.resolve(process.cwd(), 'public');
  const keyFilePath = path.join(publicDir, `${key}.txt`);
  if (!fs.existsSync(keyFilePath)) {
    fs.writeFileSync(keyFilePath, key, 'utf8');
    console.log(`[IndexNow] 已生成 key 文件: public/${key}.txt`);
  }
}

// ── 百度 ──────────────────────────────────────────────
async function pushBaidu() {
  const token = process.env.BAIDU_API_TOKEN;
  if (!token) {
    console.log('[百度] 跳过：BAIDU_API_TOKEN 未配置');
    return;
  }
  try {
    const pageUrls = await getPageUrls();
    const body = pageUrls.join('\n');
    const res = await fetch(`http://data.zz.baidu.com/urls?site=${SITE_URL}&token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
    const data = await res.json();
    console.log('[百度] 推送结果:', JSON.stringify(data));
  } catch (err) {
    console.error('[百度] 推送失败:', err.message);
  }
}

// ── IndexNow ──────────────────────────────────────────
async function pushIndexNow() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.log('[IndexNow] 跳过：INDEXNOW_KEY 未配置');
    console.log('[IndexNow] 获取密钥请访问 https://www.bing.com/indexnow/getstarted');
    return;
  }
  try {
    const pageUrls = await getPageUrls();
    if (pageUrls.length === 0) {
      console.log('[IndexNow] 无 URL 可推送');
      return;
    }
    const batch = pageUrls.slice(0, 10000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        urlList: batch,
      }),
    });
    console.log(`[IndexNow] 推送 ${batch.length} 条 URL，状态: ${res.status}`);
    if (res.status === 200 || res.status === 202) {
      console.log('[IndexNow] ✓ 提交成功');
    } else {
      const text = await res.text();
      console.log('[IndexNow] 响应:', text.substring(0, 200));
    }
  } catch (err) {
    console.error('[IndexNow] 推送失败:', err.message);
  }
}

// ── 通用 ping ─────────────────────────────────────────
async function pingSitemap(engine, endpoint) {
  try {
    const url = `${endpoint}?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const res = await fetch(url);
    console.log(`[${engine}] ping 状态: ${res.status}`);
  } catch (err) {
    console.error(`[${engine}] ping 失败:`, err.message);
  }
}

// ── 主流程 ────────────────────────────────────────────
async function main() {
  console.log(`推送 sitemap: ${SITEMAP_URL}\n`);

  generateIndexNowKeyFile();
  await pushIndexNow();

  await Promise.all([
    pushBaidu(),
    pingSitemap('360', 'https://zhanzhang.so.com/sitetool/sitemap'),
    pingSitemap('搜狗', 'https://zhanzhang.sogou.com/sitetool/urllist'),
    pingSitemap('头条搜索', 'https://om.toutiao.com/sitemap/ping'),
  ]);
}

main().catch(console.error);
