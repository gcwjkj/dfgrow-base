/// <reference types="astro/client" />

declare module 'virtual:dfgrow/config' {
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
  export const footerConfig: NonNullable<DfgrowConfig['footer']>;
  export const floatingSidebarConfig: NonNullable<DfgrowConfig['floatingSidebar']>;
}
