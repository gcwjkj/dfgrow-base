import type { DfgrowConfig } from './types.js';

/** 默认 seo 配置 */
export const defaultSeo: NonNullable<DfgrowConfig['seo']> = {
  defaultOgImage: '/og-default.jpg',
  faviconPath: '/favicon-64.png',
  logoPath: '/logo.png',
  logoHeight: 24,
  showSiteName: true,
  features: {
    chinaSeo: false,
    icpBeian: false,
    serviceWorker: true,
    llmsTxt: true,
    twitterCard: false,
  },
};

/** 默认主题 */
export const defaultTheme: NonNullable<DfgrowConfig['theme']> = {
  brandColor: '#1f44d6',
};

/** 默认 i18n 文案（中文） */
export const defaultI18n: NonNullable<DfgrowConfig['i18n']> = {
  skipToContent: '跳到主内容',
  copyright: '保留所有权利。',
  privacy: '隐私政策',
  terms: '服务条款',
  mainNav: '主导航',
  toggleMenu: '切换菜单',
  mobileNav: '移动导航',
};

/** 默认 CTA 文案 */
export const defaultCta: NonNullable<DfgrowConfig['cta']> = {
  title: '准备好开始了吗？',
  description: '联系我们，讨论你的增长目标。',
  primaryLabel: '预约咨询',
  primaryHref: '/contact',
  note: '',
};

/** 默认 Speculation Rules */
export const defaultSpeculation: NonNullable<DfgrowConfig['speculation']> = {
  excludePatterns: ['/api/*', '/search*'],
  eagerness: 'moderate',
};

/** 默认安全策略（不追加任何自定义 CSP 来源，等于基座包内置 CSP） */
export const defaultSecurity: NonNullable<DfgrowConfig['security']> = {
  csp: {},
};

/** 默认内容目录 */
export const defaultContent: NonNullable<DfgrowConfig['content']> = {
  dataDir: 'src/data',
  contentDir: 'src/content',
};

/** 默认页脚配置 */
export const defaultFooter: NonNullable<DfgrowConfig['footer']> = {
  legalLinks: true,
  privacyHref: '/privacy',
  termsHref: '/terms',
};

/**
 * 默认增长合作伙伴卡片配置。
 * - utm.source 默认 'sczhiyu'，保持向后兼容
 * - primaryHref / secondaryHref 默认指向 dfgrow.com
 * - casesSecondaryHref 默认指向 /method（与方法页保持一致）
 * - footerCredit 默认 false：客户未显式同意时不展示页脚致谢区块
 */
export const defaultGrowthPartner: NonNullable<DfgrowConfig['growthPartner']> = {
  utm: {
    source: 'sczhiyu',
    medium: 'referral',
    footerMedium: 'footer',
  },
  primaryHref: 'https://dfgrow.com/',
  secondaryHref: 'https://dfgrow.com/services',
  casesSecondaryHref: 'https://dfgrow.com/method',
  primaryLabel: '了解登峰增长',
  secondaryLabel: '查看方法与服务',
  appendUtm: true,
  footerCredit: false,
  footerCreditLabel: '登峰增长',
  footerCreditPrefix: '官网由',
  footerCreditSuffix: '搭建及提供SEO/GEO优化支持。',
};

/**
 * 判断是否启用了任一分析工具。
 * Analytics.astro 从 PUBLIC_* 环境变量加载分析脚本，故以此为准。
 * 构建期通过 process.env 判断（用于校验/warn）；运行期组件通过 import.meta.env 判断。
 */
function hasAnalyticsEnv(env: NodeJS.ProcessEnv | Record<string, any>): boolean {
  return Boolean(env.PUBLIC_GA4_ID || env.PUBLIC_CLARITY_ID || env.PUBLIC_BAIDU_TONGJI_ID);
}

/**
 * 深度合并用户配置与默认值。
 * 客户提供 dfgrow.config.ts 中的 Partial<DfgrowConfig> 会与此函数合并。
 */
export function resolveConfig(userConfig: Partial<DfgrowConfig>): DfgrowConfig {
  if (!userConfig.site) {
    throw new Error('[@gcwjkj/dfgrow-base] site config is required. Please provide at minimum { site: { name, domain, url, ... } } in your dfgrow.config.ts');
  }

  if (!userConfig.nav) {
    throw new Error('[@gcwjkj/dfgrow-base] nav config is required. Please provide { nav: { main, cta, footer, footerLabels } } in your dfgrow.config.ts');
  }

  const footer: NonNullable<DfgrowConfig['footer']> = { ...defaultFooter, ...userConfig.footer };
  const i18n = { ...defaultI18n, ...userConfig.i18n };
  const analyticsEnabled = hasAnalyticsEnv(process.env);

  // 合规校验：开启分析工具时，强制显示隐私/条款链接并校验文案非空
  if (analyticsEnabled) {
    if (footer.legalLinks === false) {
      console.warn(
        '[@gcwjkj/dfgrow-base] 检测到已启用分析工具（GA4 / Clarity / 百度统计），' +
        '出于《个人信息保护法》合规要求，已忽略 footer.legalLinks: false，页脚将强制显示隐私政策 / 服务条款链接。',
      );
      footer.legalLinks = true;
    }
    if (!i18n.privacy || !i18n.terms) {
      console.warn(
        '[@gcwjkj/dfgrow-base] 检测到已启用分析工具，但 i18n.privacy / i18n.terms 文案为空。' +
        '请补充隐私政策与服务条款文案，并确保 /privacy、/terms 页面已创建。',
      );
    }
  }

  return {
    site: userConfig.site,
    nav: userConfig.nav,
    theme: { ...defaultTheme, ...userConfig.theme },
    seo: deepMerge(defaultSeo, userConfig.seo ?? {}),
    i18n,
    cta: { ...defaultCta, ...userConfig.cta },
    speculation: { ...defaultSpeculation, ...userConfig.speculation },
    security: { ...defaultSecurity, ...userConfig.security },
    content: { ...defaultContent, ...userConfig.content },
    footer,
    analytics: userConfig.analytics,
    floatingSidebar: userConfig.floatingSidebar,
    growthPartner: deepMerge(defaultGrowthPartner, userConfig.growthPartner ?? {}),
    overrides: userConfig.overrides,
  };
}

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const ov = override[key];
    const bv = base[key];
    if (ov !== undefined && bv !== undefined && typeof ov === 'object' && typeof bv === 'object' && !Array.isArray(ov) && !Array.isArray(bv)) {
      result[key] = deepMerge(bv as object, ov as object) as T[keyof T];
    } else if (ov !== undefined) {
      result[key] = ov as T[keyof T];
    }
  }
  return result;
}
