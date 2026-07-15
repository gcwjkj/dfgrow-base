// @gcwjkj/dfgrow-base — public API
export { default as dfgrowBase } from './src/integration.js';
export type { DfgrowConfig, SiteConfig, NavConfig, DfgrowTheme, AnalyticsConfig, SeoConfig, I18nConfig, CtaConfig, SpeculationConfig, ContentConfig, FooterConfig, GrowthPartnerConfig, ComponentOverrides, FaqCategory, FaqItem, FaqCategoryMeta, BlogPostFrontmatter } from './src/types.js';

// CMS / Payload integration
export { fetchBlogs, fetchCases, fetchFaqs, configurePayloadClient } from './src/lib/payload-client.js';
export { payloadBlogLoader } from './src/lib/payload-loader.js';
export type { PayloadBlogEntry, PayloadCaseEntry, PayloadFaqEntry, PayloadClientOptions } from './src/lib/payload-client.js';
export type { PayloadBlogLoaderOptions } from './src/lib/payload-loader.js';

// Blog content collection helpers
export { createBlogCollection } from './src/lib/blog-collection.js';
export type { CreateBlogCollectionOptions } from './src/lib/blog-collection.js';
export { getBlogPosts, renderPost } from './src/lib/blog.js';
export type { BlogPost } from './src/lib/blog.js';
