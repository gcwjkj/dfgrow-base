import type { AstroIntegration } from 'astro';
import type { DfgrowConfig } from './types.js';
import { resolveConfig } from './defaults.js';
import { generateConfigModule } from './virtual-config.js';
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { generateLlmsTxt, generateLlmsFullTxt } from './lib/generate-llms-txt.mjs';
import { generateRobotsTxt } from './lib/generate-robots.mjs';
import { generateServiceWorker } from './lib/generate-sw.mjs';
import { generateManifest } from './lib/generate-manifest.mjs';
import { generateRssFeed } from './lib/generate-rss.mjs';
import {
  createCssLegacyTranspilePlugin,
  type LegacyCssTranspileOptions,
} from './vite/css-legacy-transpile.js';

export interface DfgrowBaseOptions extends Partial<DfgrowConfig> {
  /** 客户配置文件路径（相对于项目根），默认 'dfgrow.config' */
  configPath?: string;
  /**
   * 百度 T7 / 老内核 CSS 兼容降级。
   * - 默认启用（true）：剥离 @layer 包装 + lightningcss 降级 oklch/color-mix 等
   * - false：关闭
   * - 对象：自定义 targets（如 { chrome: 70, safari: 13 }）
   * 默认 true。详见 src/vite/css-legacy-transpile.ts。
   */
  legacyCssTranspile?: LegacyCssTranspileOptions;
}

export default function dfgrowBase(userOptions: DfgrowBaseOptions = {}): AstroIntegration {
  let resolved: DfgrowConfig | null = null;

  return {
    name: '@gcwjkj/dfgrow-base',
    hooks: {
      'astro:config:setup': async ({ config: astroConfig, updateConfig }) => {
        // 尝试加载客户配置文件或使用传入的 options
        let fileConfig: Partial<DfgrowConfig> = {};
        const rootDir = fileURLToPath(astroConfig.root);
        const configModulePath = join(rootDir, 'dfgrow.config.ts');

        if (existsSync(configModulePath)) {
          try {
            fileConfig = loadConfigFile(configModulePath, rootDir);
          } catch (err) {
            console.warn(`[@gcwjkj/dfgrow-base] 无法加载 ${configModulePath}:`, (err as Error).message);
          }
        }

        // 合并：文件配置 > 用户传入 options
        const merged = { ...userOptions, ...fileConfig };
        delete (merged as Record<string, unknown>).configPath;

        // 写入虚拟模块类型声明到消费方项目根目录（兼容所有 Astro 版本）
        const typesFile = join(rootDir, 'dfgrow-env.d.ts');
        const typesContent = `declare module 'virtual:dfgrow/config' {
  import type { DfgrowConfig } from '@gcwjkj/dfgrow-base/types';
  const config: DfgrowConfig;
  export default config;
  export const siteConfig: DfgrowConfig['site'];
  export const navConfig: DfgrowConfig['nav'];
  export const themeConfig: NonNullable<DfgrowConfig['theme']>;
  export const seoConfig: NonNullable<DfgrowConfig['seo']>;
  export const i18nConfig: NonNullable<DfgrowConfig['i18n']>;
  export const ctaConfig: NonNullable<DfgrowConfig['cta']>;
  export const speculationConfig: NonNullable<DfgrowConfig['speculation']>;
  export const securityConfig: NonNullable<DfgrowConfig['security']>;
  export const footerConfig: NonNullable<DfgrowConfig['footer']>;
  export const floatingSidebarConfig: NonNullable<DfgrowConfig['floatingSidebar']>;
  export const growthPartnerConfig: NonNullable<DfgrowConfig['growthPartner']>;
}
`;
        if (!existsSync(typesFile) || readFileSync(typesFile, 'utf8') !== typesContent) {
          writeFileSync(typesFile, typesContent, 'utf8');
        }

        if (!merged.site) {
          console.warn('[@gcwjkj/dfgrow-base] 未检测到配置 — 集成处于待机模式。请创建 dfgrow.config.ts 或传入选项。');
          return; // 待机模式 — 不注册任何内容
        }

        resolved = resolveConfig(merged);

        // 注册虚拟模块 + 百度 T7 CSS 兼容降级插件
        const legacyCssOpts = userOptions.legacyCssTranspile ?? { enabled: true };
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'virtual-dfgrow-config',
                resolveId(id) {
                  if (id === 'virtual:dfgrow/config' || id === '@gcwjkj/dfgrow-base/config') {
                    return '\0' + id;
                  }
                },
                load(id) {
                  if (id === '\0virtual:dfgrow/config' || id === '\0@gcwjkj/dfgrow-base/config') {
                    if (!resolved) return '';
                    return generateConfigModule(resolved);
                  }
                },
              },
              // 百度 T7 / 老内核兼容：剥离 @layer 包装 + lightningcss 降级现代 CSS
              createCssLegacyTranspilePlugin(legacyCssOpts),
            ],
          },
        });

        // 设置 Astro site URL
        updateConfig({ site: resolved.site.url });

        // 注意：sitemap 由消费方自行在 astro.config.mjs 中注册 @astrojs/sitemap。
        // dfgrow-base 不自动注册，避免与客户已有的 sitemap 配置冲突。
      },

      'astro:build:done': ({ dir }) => {
        if (!resolved) return;

        const outDir = fileURLToPath(dir);
        const siteUrl = resolved.site.url.replace(/\/$/, '');
        const features = resolved.seo.features ?? {};

        // 1. 复制 sitemap-index.xml → sitemap.xml（搜索引擎默认查找 /sitemap.xml）
        const sitemapIndex = join(outDir, 'sitemap-index.xml');
        const sitemapXml = join(outDir, 'sitemap.xml');
        if (existsSync(sitemapIndex) && !existsSync(sitemapXml)) {
          copyFileSync(sitemapIndex, sitemapXml);
          console.log('[@gcwjkj/dfgrow-base] 已生成 sitemap.xml');
        }

        // 2. 生成 robots.txt（带 AI 爬虫白名单，不覆盖消费方自定义的）
        const robotsTxt = join(outDir, 'robots.txt');
        if (!existsSync(robotsTxt)) {
          writeFileSync(robotsTxt, generateRobotsTxt(resolved), 'utf8');
          console.log('[@gcwjkj/dfgrow-base] 已生成 robots.txt（含 AI 爬虫白名单）');
        }

        // 3. 生成 llms.txt + llms-full.txt（GEO 核心）
        if (features.llmsTxt !== false) {
          const llmsTxtPath = join(outDir, 'llms.txt');
          if (!existsSync(llmsTxtPath)) {
            writeFileSync(llmsTxtPath, generateLlmsTxt(resolved), 'utf8');
            console.log('[@gcwjkj/dfgrow-base] 已生成 llms.txt');
          }
          const llmsFullTxtPath = join(outDir, 'llms-full.txt');
          if (!existsSync(llmsFullTxtPath)) {
            writeFileSync(llmsFullTxtPath, generateLlmsFullTxt(resolved), 'utf8');
            console.log('[@gcwjkj/dfgrow-base] 已生成 llms-full.txt');
          }
        }

        // 4. 生成 Service Worker（多策略缓存）
        if (features.serviceWorker !== false) {
          const swPath = join(outDir, 'sw.js');
          writeFileSync(swPath, generateServiceWorker(resolved), 'utf8');
          console.log('[@gcwjkj/dfgrow-base] 已生成 sw.js（多策略缓存）');

          // 5. 生成 manifest.json（PWA）
          const manifestPath = join(outDir, 'manifest.json');
          if (!existsSync(manifestPath)) {
            writeFileSync(manifestPath, generateManifest(resolved), 'utf8');
            console.log('[@gcwjkj/dfgrow-base] 已生成 manifest.json');
          }
        }

        // 6. 生成 RSS feed
        const rssPath = join(outDir, 'rss.xml');
        if (!existsSync(rssPath)) {
          writeFileSync(rssPath, generateRssFeed(resolved), 'utf8');
          console.log('[@gcwjkj/dfgrow-base] 已生成 rss.xml');
        }
      },
    },
  };
}

/**
 * 使用 esbuild 转译 TypeScript 配置文件，在独立子进程中加载。
 * 这避免了 Vite ModuleRunner 在 astro:config:setup 阶段已关闭的问题。
 */
function loadConfigFile(configPath: string, rootDir: string): Partial<DfgrowConfig> {
  const _require = createRequire(import.meta.url);
  const esbuild = _require('esbuild') as typeof import('esbuild');

  const code = readFileSync(configPath, 'utf-8');

  // 1. 用 esbuild 剥离 TypeScript 类型，输出纯 CJS JavaScript
  const result = esbuild.transformSync(code, {
    loader: 'ts',
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcefile: configPath,
  });

  // 2. 写入临时 .cjs 文件（转译后的代码无外部依赖，完全自包含）
  const cacheDir = join(rootDir, 'node_modules', '.cache');
  mkdirSync(cacheDir, { recursive: true });
  const tempPath = join(cacheDir, `dfgrow-config-${process.pid}-${Date.now()}.cjs`);
  writeFileSync(tempPath, result.code, 'utf-8');

  try {
    // 3. 在独立子进程中 require 临时文件并输出 JSON
    const json = execFileSync(process.execPath, [
      '-e',
      'process.stdout.write(JSON.stringify(require(process.argv[1]).default||require(process.argv[1])))',
      tempPath,
    ], {
      encoding: 'utf-8',
      cwd: rootDir,
      timeout: 10000,
    });
    return JSON.parse(json) as Partial<DfgrowConfig>;
  } finally {
    try { unlinkSync(tempPath); } catch { /* ignore */ }
  }
}
