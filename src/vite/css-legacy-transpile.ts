/**
 * 百度 T7 / 老内核兼容 CSS 降级 Vite 插件
 * --------------------------------------------
 * 根因：Tailwind v4 通过 @tailwindcss/vite 编译输出时，会把所有
 * 工具类放进 `@layer utilities { ... }`、`@layer base { ... }` 等
 * 级联层里。CSS `@layer`（Cascade Layers）是 Chrome 99+ 才支持的特性，
 * 手机百度 T7 内核（约等于 Chrome 60–80）不认识 `@layer`，解析时
 * 会把整个 `@layer { ... }` 块丢弃 → 所有 Tailwind 工具类集体丢失
 * → 图标撑成默认 300×150、间距/内边距消失、布局整体错乱。
 *
 * 本插件在 Tailwind 输出 CSS 后做两件事：
 *  1) 用 lightningcss（targets 设为 Chrome 60）降级 oklch()、color-mix()、
 *     margin-inline、padding-block 等现代 CSS 特性；
 *  2) 手动剥离所有 `@layer <name> { ... }` 包装（花括号计数，正确处理
 *     嵌套的 @supports / @media），把内部规则提到根层级。
 *
 * 对现代浏览器零影响（降级后的 CSS 是等价的，仅写法更老派）。
 *
 * 通过 DfgrowBaseOptions.legacyCssTranspile 控制：
 *   - true（默认）：启用
 *   - false：关闭（例如消费方已自行处理）
 *   - 对象：自定义 targets，如 { chrome: 70, safari: 13, firefox: 70 }
 */
import type { Plugin } from 'vite';
import { createRequire } from 'module';

export type LegacyCssTargets = {
  chrome?: number;
  safari?: number;
  firefox?: number;
  ios_saf?: number;
  edge?: number;
};

export interface LegacyCssTranspileOptions {
  /** false 禁用；true 用默认 targets；对象则自定义 targets */
  enabled?: boolean | LegacyCssTargets;
}

const DEFAULT_TARGETS: Required<Pick<LegacyCssTargets, 'chrome' | 'safari' | 'firefox'>> = {
  chrome: 60,
  safari: 12,
  firefox: 60,
};

/** 把版本号转换为 lightningcss 的 version integer（major << 16 | minor << 8 | patch） */
function toVersionInt(v: number): number {
  return v << 16;
}

/**
 * 手动剥离所有 `@layer <name> { ... }` 包装。
 * 用花括号计数正确处理嵌套块（@layer 里包着 @supports / @media 等）。
 * lightningcss 即使设了 chrome 60 target，目前也不会主动剥离 @layer，
 * 所以这里自己做。
 */
function stripCascadeLayers(css: string): string {
  let result = '';
  let i = 0;
  while (i < css.length) {
    const remaining = css.slice(i);
    const m = remaining.match(/@layer\s+[a-zA-Z_][\w-]*\s*\{/);
    if (!m) {
      result += remaining;
      break;
    }
    const prefixEnd = i + m.index!;
    result += css.slice(i, prefixEnd);

    const openBracePos = prefixEnd + m[0].lastIndexOf('{');
    let j = openBracePos + 1;
    let depth = 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    // j 现在指向匹配的 } 之后；提取内部内容
    const inner = css.slice(openBracePos + 1, j - 1);
    result += inner;
    i = j;
  }
  return result;
}

/**
 * 动态加载 lightningcss。
 * 优先用消费方项目的 node_modules（通过 createRequire 解析），
 * 找不到时给清晰错误提示。
 */
function loadLightningCss(): { transform: (opts: any) => { code: Uint8Array } } | null {
  try {
    const _require = createRequire(import.meta.url);
    return _require('lightningcss');
  } catch {
    // 尝试从项目根 node_modules 解析
    try {
      const _require = createRequire(import.meta.url);
      const resolved = _require.resolve('lightningcss', { paths: [process.cwd()] });
      return _require(resolved);
    } catch {
      return null;
    }
  }
}

export function createCssLegacyTranspilePlugin(opts: LegacyCssTranspileOptions = {}): Plugin {
  const userTargets = opts.enabled && typeof opts.enabled === 'object' ? opts.enabled : DEFAULT_TARGETS;

  return {
    name: 'dfgrow-css-legacy-transpile',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      if (opts.enabled === false) return;

      const lightningcss = loadLightningCss();
      if (!lightningcss) {
        console.warn(
          '[@gcwjkj/dfgrow-base] legacyCssTranspile 已启用但未找到 lightningcss。\n' +
          '请在项目 devDependencies 中安装：npm i -D lightningcss\n' +
          '(Tailwind v4 已内置该依赖，通常无需额外安装)'
        );
        return;
      }

      const targets: Record<string, number> = {};
      if (userTargets.chrome) targets.chrome = toVersionInt(userTargets.chrome);
      if (userTargets.safari) targets.safari = toVersionInt(userTargets.safari);
      if (userTargets.firefox) targets.firefox = toVersionInt(userTargets.firefox);
      if (userTargets.ios_saf) targets.ios_saf = toVersionInt(userTargets.ios_saf);
      if (userTargets.edge) targets.edge = toVersionInt(userTargets.edge);

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'asset' || !fileName.endsWith('.css')) continue;
        try {
          const source =
            typeof chunk.source === 'string'
              ? Buffer.from(chunk.source)
              : (chunk.source as Uint8Array | Buffer);
          const result = lightningcss.transform({
            filename: fileName,
            code: source as Uint8Array,
            minify: false,
            sourceMap: false,
            errorRecovery: true,
            targets,
          });
          if (result && result.code) {
            let css = Buffer.from(result.code).toString('utf-8');
            css = stripCascadeLayers(css);
            chunk.source = Buffer.from(css);
            const stillHasLayer = css.includes('@layer');
            console.log(
              `[@gcwjkj/dfgrow-base] CSS 降级 ${fileName} — @layer ${stillHasLayer ? '仍残留(异常)' : '已剥离'}`
            );
          }
        } catch (e) {
          console.warn(
            `[@gcwjkj/dfgrow-base] CSS 降级失败 ${fileName}:`,
            (e as Error)?.message || e
          );
        }
      }
    },
  };
}
