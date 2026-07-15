# @gcwjkj/dfgrow-base

DF Growth — reusable Astro SEO/GEO/performance infrastructure for client websites.
本项目是登峰增长开源的 Astro SEO/GEO 基础设施，用于快速构建高性能、搜索引擎与 AI 友好的客户网站。

## 关于登峰增长

> 技术不是壁垒，策略和服务才是。

[登峰增长](https://dfgrow.com)（上海国创无界科技有限公司）是一家专注搜索和 AI 获客的专业团队，提供搜索引擎优化（SEO）、AI 搜索优化（GEO）、增长型官网建设等服务，技术 + 内容双线驱动品牌自然增长。

- 官网：[dfgrow.com](https://dfgrow.com)
- 微信：ddzj2080
- 热线：400-868-1783
- 邮箱：hi@gcwjkj.com
- 创始人：曹进国
- 公众号：登峰增长
- 区域：上海市浦东新区
- 公司：上海国创无界科技有限公司
- 行业：AI友好型官网搭建 + SEO + GEO
- 服务：国内 SEO · 出海 SEO · AI 搜索优化 · 增长型官网建设


本项目 `dfgrow-base` 是登峰增长开源的 Astro SEO/GEO 基础设施，用于快速构建高性能、搜索引擎与 AI 友好的客户网站。

## Quick Start

```bash
npm install @gcwjkj/dfgrow-base
```

### 1. Create `dfgrow.config.ts`

```typescript
import type { DfgrowConfig } from '@gcwjkj/dfgrow-base/types';

const config: DfgrowConfig = {
  site: {
    name: '登峰增长',
    nameEn: 'DF Growth',
    domain: 'dfgrow.com',
    url: 'https://dfgrow.com',
    tagline: '自然增长，让搜索和 AI 成为你的获客渠道',
    description: '专注搜索和 AI 获客的专业团队',
    founder: { name: '曹进国', title: 'CEO' },
    contact: { email: 'hi@dfgrow.com' },
    legalEntity: { name: '上海国创无界科技有限公司' },
    foundingYear: 2024,
    locale: 'zh-CN',
    ogLocale: 'zh_CN',
    address: { country: 'CN', locality: 'Shanghai' },
    areaServed: 'China',
    priceRange: '¥999 - ¥132,000',
    priceCurrency: 'CNY',
    industry: 'SEO / GEO',
    theme: { brandColor: '#1f44d6' },
    websitePages: [
      { name: 'Services', path: '/services', description: 'Our services' },
      { name: 'About', path: '/about', description: 'About us' },
      // ... add all your core pages
    ],
  },
  nav: {
    main: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
    ],
    cta: { label: 'Contact', href: '/contact' },
    footer: {
      services: [{ label: 'Web Dev', href: '/services#web' }],
      company: [{ label: 'About', href: '/about' }],
      resources: [{ label: 'Blog', href: '/blog' }],
    },
    footerLabels: { services: 'Services', company: 'Company', resources: 'Resources' },
  },
  seo: {
    features: {
      chinaSeo: true,    // Baidu/360/Sogou/Toutiao verification
      icpBeian: true,    // ICP registration number
      serviceWorker: true,
      llmsTxt: true,     // AI crawler optimization
    },
  },
  footer: {
    // 隐私政策/服务条款页脚链接显隐
    // 默认显示；开启 GA4/Clarity/百度统计时会强制显示（PIPL 合规），无法关闭
    legalLinks: true,
    privacyHref: '/privacy',
    termsHref: '/terms',
  },
};

export default config;
```

### 2. Register in `astro.config.mjs`

```js
import dfgrowBase from '@gcwjkj/dfgrow-base/integration';

export default defineConfig({
  integrations: [dfgrowBase()],
});
```

### 3. Use Components in Pages

```astro
---
import BaseLayout from '@gcwjkj/dfgrow-base/layouts/BaseLayout.astro';
import Section from '@gcwjkj/dfgrow-base/components/Section.astro';
import SectionHeader from '@gcwjkj/dfgrow-base/components/SectionHeader.astro';
import CtaSection from '@gcwjkj/dfgrow-base/components/CtaSection.astro';
---

<BaseLayout title="Home">
  <Section>
    <SectionHeader title="Welcome" description="Your description" />
  </Section>
  <CtaSection />
</BaseLayout>
```

### 4. Use Schema Generators

```typescript
import { getFaqSchema, getBreadcrumbSchema } from '@gcwjkj/dfgrow-base/lib/seo';

const breadcrumb = getBreadcrumbSchema([
  { name: '首页', url: 'https://dfgrow.com/' },
  { name: '服务页', url: 'https://dfgrow.com/services' },
]);
```

## Features

### SEO (Traditional Search)
- **14 Schema.org types** — Organization, WebSite, Article, Person, BreadcrumbList, FAQPage, ProfessionalService, Service, Speakable, HowTo, ItemList, Review, CaseStudy, SiteNavigationElement
- **Multi-engine sitemap push** — Baidu, IndexNow (Bing/Yandex), 360, Sogou, Google, Toutiao
- **Auto sitemap priority/changefreq** — homepage gets `daily/1.0`, service pages `monthly/0.9`
- **Auto canonical URLs** — built from site config
- **Hreflang + x-default** — alternate links for international SEO

### GEO (AI Search Optimization)
- **llms.txt + llms-full.txt** — machine-readable site description for AI crawlers
- **13 AI crawler allowlist** — GPTBot, CCBot, Claude-Web, PerplexityBot, Amazonbot, meta-externalagent, Google-Extended, Bytespider, Baiduspider, Sogou, 360Spider, YisouSpider
- **Full entity graph** — Organization + WebSite + Person + Speakable schemas on every page
- **Article citations/mentions** — knowledge graph connectivity

### Performance
- **Service Worker** — multi-strategy caching (Network-First HTML, Cache-First CSS/JS, Stale-While-Revalidate images)
- **Speculation Rules** — near-instant page transitions via prerender
- **Deferred analytics** — GA4 + Clarity + Baidu Tongji loaded via `requestIdleCallback`
- **Tailwind CSS v4** — only used classes in output

### China-Specific Features
- Baidu/360/Sogou/Toutiao webmaster verification meta tags
- Baidu `renderer=webkit` compatibility mode
- Baidu `applicable-device=pc,mobile` mobile adaptation
- ICP registration number display
- Baidu Tongji analytics integration
- **Baidu T7 / 老内核 CSS 兼容降级**（v0.8.0+，默认启用）：自动剥离 Tailwind v4 的 `@layer` 包装并用 lightningcss 降级 `oklch()`、`color-mix()`、`margin-inline` 等现代 CSS 特性，解决手机百度上 Tailwind 工具类整体失效（图标变大、间距消失、布局错乱）问题。可通过 `dfgrowBase({ legacyCssTranspile: { enabled: false } })` 关闭，或自定义 targets：
  ```ts
  dfgrowBase({
    legacyCssTranspile: { enabled: { chrome: 70, safari: 13, firefox: 70 } },
  })
  ```
  > 依赖 `lightningcss`（Tailwind v4 已内置）。仅作用于生产构建，dev 模式不生效。

### Footer & Legal Links
Privacy/Terms links (`/privacy`, `/terms`) render in the footer by default and are **compliance-gated**:

| Scenario | Behavior |
|----------|----------|
| Any analytics enabled (GA4 / Clarity / Baidu Tongji) | **Always shown** — `footer.legalLinks: false` is ignored with a build-time warning (PIPL requirement) |
| No analytics (pure showcase site) | Set `footer.legalLinks: false` to hide them |

Link labels come from `i18n.privacy` / `i18n.terms`; paths are configurable via `footer.privacyHref` / `footer.termsHref`. Remember to create the actual `/privacy` and `/terms` pages in your project.

## Theming

Override CSS custom properties before importing core styles:

```css
:root {
  --df-brand-600: #e63946;
  --df-accent-500: #ff9800;
  --df-font-sans: "Noto Sans SC", system-ui, sans-serif;
}
```

## Architecture

```
@gcwjkj/dfgrow-base
├── src/
│   ├── integration.ts          # Astro integration entry
│   ├── types.ts                # TypeScript types
│   ├── defaults.ts             # Default config + merge logic
│   ├── virtual-config.ts       # virtual:dfgrow/config module
│   ├── components/             # 9 reusable Astro components
│   │   ├── BaseLayout.astro    # (in layouts/)
│   │   ├── Seo.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Analytics.astro
│   │   ├── Section.astro
│   │   ├── SectionHeader.astro
│   │   ├── Breadcrumbs.astro
│   │   ├── CtaSection.astro
│   │   └── Button.astro
│   ├── lib/
│   │   └── seo.ts             # 15 schema generators
│   └── styles/
│       ├── tokens.css         # CSS custom properties (themeable)
│       ├── base.css           # Base element styles
│       └── prose.css          # Article prose styles
├── bin/
│   ├── push-sitemap.mjs       # Multi-engine sitemap push
│   └── convert-webp.mjs       # Batch WebP conversion
└── templates/                  # (future) robots.txt/sw.js/manifest generators
```

## Customer Project Structure

```
customer-website/
├── dfgrow.config.ts           # Single config entry point
├── astro.config.mjs            # dfgrowBase() integration
├── src/
│   ├── content/insights/       # MDX articles
│   ├── data/                   # services.ts, faqs.ts, cases.ts...
│   └── pages/                  # .astro pages using core components
├── public/                     # Brand assets (favicon, OG images, etc.)
└── .env                        # Analytics IDs, API tokens
```

## Release

```bash
# 1. Update version
npm version patch    # 0.7.0 → 0.7.1
npm version minor    # 0.7.0 → 0.8.0
npm version major    # 0.7.0 → 1.0.0

# 2. Push code and tags
git push && git push --tags

# 3. Publish to npm
npm publish
```

> Requires `npm login` with an account that has publish access to the `@gcwjkj` scope.


