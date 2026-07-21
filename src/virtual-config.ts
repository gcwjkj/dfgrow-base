import type { DfgrowConfig } from './types.js';

/**
 * 生成 virtual:dfgrow/config 模块的 ES module 源码。
 * 组件通过 `import { siteConfig, seoConfig, ... } from 'virtual:dfgrow/config'` 获取运行时配置。
 */
export function generateConfigModule(config: DfgrowConfig): string {
  const site = JSON.stringify(config.site);
  const nav = JSON.stringify(config.nav);
  const theme = JSON.stringify(config.theme ?? {});
  const seo = JSON.stringify(config.seo ?? {});
  const i18n = JSON.stringify(config.i18n ?? {});
  const cta = JSON.stringify(config.cta ?? {});
  const speculation = JSON.stringify(config.speculation ?? {});
  const security = JSON.stringify(config.security ?? {});
  const footer = JSON.stringify(config.footer ?? {});
  const floatingSidebar = JSON.stringify(config.floatingSidebar ?? null);
  const growthPartner = JSON.stringify(config.growthPartner ?? {});

  return `
export const siteConfig = /** @type {import('@gcwjkj/dfgrow-base/types').SiteConfig} */ (${site});
export const navConfig = /** @type {import('@gcwjkj/dfgrow-base/types').NavConfig} */ (${nav});
export const themeConfig = /** @type {import('@gcwjkj/dfgrow-base/types').DfgrowTheme} */ (${theme});
export const seoConfig = /** @type {import('@gcwjkj/dfgrow-base/types').SeoConfig} */ (${seo});
export const i18nConfig = /** @type {import('@gcwjkj/dfgrow-base/types').I18nConfig} */ (${i18n});
export const ctaConfig = /** @type {import('@gcwjkj/dfgrow-base/types').CtaConfig} */ (${cta});
export const speculationConfig = /** @type {import('@gcwjkj/dfgrow-base/types').SpeculationConfig} */ (${speculation});
export const securityConfig = /** @type {import('@gcwjkj/dfgrow-base/types').SecurityConfig} */ (${security});
export const footerConfig = /** @type {import('@gcwjkj/dfgrow-base/types').FooterConfig} */ (${footer});
export const floatingSidebarConfig = /** @type {import('@gcwjkj/dfgrow-base/types').FloatingSidebarConfig | null} */ (${floatingSidebar});
export const growthPartnerConfig = /** @type {import('@gcwjkj/dfgrow-base/types').GrowthPartnerConfig} */ (${growthPartner});
const config = { site: siteConfig, nav: navConfig, theme: themeConfig, seo: seoConfig, i18n: i18nConfig, cta: ctaConfig, speculation: speculationConfig, security: securityConfig, footer: footerConfig, floatingSidebar: floatingSidebarConfig, growthPartner: growthPartnerConfig };
export default config;
`.trim();
}
