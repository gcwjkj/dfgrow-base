// @gcwjkj/dfgrow-base — public API
export { default as dfgrowBase } from './src/integration.js';
export type { DfgrowConfig, SiteConfig, NavConfig, DfgrowTheme, AnalyticsConfig, SeoConfig, I18nConfig, CtaConfig, SpeculationConfig, ContentConfig, ComponentOverrides, FaqCategory, FaqItem, FaqCategoryMeta, BlogPostFrontmatter } from './src/types.js';

// CMS / Payload integration
export { fetchBlogs, fetchCases, fetchFaqs, configurePayloadClient } from './src/lib/payload-client.js';
export { payloadBlogLoader } from './src/lib/payload-loader.js';
export type { PayloadBlogEntry, PayloadCaseEntry, PayloadFaqEntry, PayloadClientOptions } from './src/lib/payload-client.js';
export type { PayloadBlogLoaderOptions } from './src/lib/payload-loader.js';
