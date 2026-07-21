// @gcwjkj/dfgrow-base — Configuration Types

/**
 * 导航项 — 同时用于顶级导航和下拉子项。
 * 所有增强字段均为可选，未使用时组件行为与原始版本一致。
 */
export interface NavItem {
  label: string;
  href: string;
  /** 下拉子菜单项 */
  children?: NavItem[];

  // ── 子项增强（仅当作为 children 数组元素时生效） ──

  /** 角标文字，如 'HOT'、'NEW'、'推荐' */
  badge?: string;
  /** 角标样式：hot=红底白字，new=绿底白字，默认=灰底黑字 */
  badgeStyle?: 'hot' | 'new' | 'default';
  /** 在此项前渲染一条分隔线 */
  separatorBefore?: boolean;
  /** 子项描述文字，显示在 label 下方（仅下拉菜单内） */
  description?: string;

  // ── 父级下拉增强（仅当 children 存在时生效） ──

  /** 下拉布局：single=单列列表（默认），grid=双列卡片网格 */
  dropdownLayout?: 'single' | 'grid';
  /** 下拉菜单顶部引导链接（如「不知道怎么选？先看选择指南 →」） */
  dropdownHeader?: {
    label: string;
    href: string;
    description?: string;
  };
  /** 下拉菜单底部资源区（如「下载 GEO 白皮书」） */
  dropdownFooter?: {
    title: string;
    items: Array<{ label: string; href: string; description?: string }>;
  };

  // ── 外链行为 ──

  /**
   * 是否作为外链在新标签页打开。
   * - 未设置（undefined）：自动判断 —— href 以 http:// 或 https:// 开头时视为外链
   * - `true`：强制新标签页打开
   * - `false`：强制当前页跳转（即使是绝对 URL）
   */
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  nameEn?: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  founder: {
    name: string;
    title: string;
    university?: string;
  };
  contact: {
    email: string;
    wechat?: string;
    phone?: string;
  };
  social?: Record<string, string>;
  legalEntity: {
    name: string;
    shortName?: string;
    creditCode?: string;
  };
  beian?: {
    icp?: string;
    icpUrl?: string;
  };
  foundingYear: number;
  locale: string;
  ogLocale: string;
  address: {
    country: string;
    locality: string;
  };
  areaServed: string;
  priceRange: string;
  priceCurrency: string;
  industry: string;
  theme: {
    brandColor: string;
  };
  websitePages: Array<{
    name: string;
    path: string;
    description: string;
  }>;
}

export interface NavConfig {
  main: NavItem[];
  cta: NavItem;
  /** 移动端菜单专用 CTA（不设置则复用 cta） */
  mobileCta?: NavItem;
  footer: {
    services: NavItem[];
    company: NavItem[];
    resources: NavItem[];
  };
  footerLabels: {
    services: string;
    company: string;
    resources: string;
  };
  /**
   * 动态页脚列（优先于 footer/footerLabels）。
   * 设置后页脚按此数组渲染任意数量的列，不受 services/company/resources 三列限制。
   */
  footerColumns?: Array<{
    label: string;
    items: NavItem[];
  }>;
}

export interface DfgrowTheme {
  brandColor?: string;
  fonts?: {
    sans?: string;
    mono?: string;
  };
  containerMax?: string;
}

export interface AnalyticsConfig {
  ga4Id?: string;
  clarityId?: string;
  baiduTongjiId?: string;
}

export interface SeoConfig {
  defaultOgImage?: string;
  faviconPath?: string;
  logoPath?: string;
  logoHeight?: number;
  showSiteName?: boolean;
  features?: {
    chinaSeo?: boolean;
    icpBeian?: boolean;
    serviceWorker?: boolean;
    llmsTxt?: boolean;
    twitterCard?: boolean;
  };
}

export interface I18nConfig {
  skipToContent?: string;
  copyright?: string;
  privacy?: string;
  terms?: string;
  mainNav?: string;
  toggleMenu?: string;
  mobileNav?: string;
}

export interface CtaConfig {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  note?: string;
}

export interface SpeculationConfig {
  excludePatterns?: string[];
  eagerness?: 'immediate' | 'eager' | 'moderate' | 'conservative';
}

/**
 * 安全策略配置 — 控制 BaseLayout 输出的 Content-Security-Policy 头。
 *
 * 基座包内置了一套合理的默认 CSP（仅允许同源 + 常见分析工具域名），
 * 各项目可通过此配置追加自定义域名，避免硬编码到基座包源码中。
 *
 * 例：
 * ```ts
 * security: {
 *   csp: {
 *     imgSrc: ['https://cms.gcwjkj.com'],
 *     connectSrc: ['https://api.example.com'],
 *   }
 * }
 * ```
 */
export interface SecurityConfig {
  /**
   * CSP 自定义补充域名。
   * 每项都是 CSP 指令关键字后面的额外来源，会追加到基座包内置的默认列表后面。
   * 不配置或留空时，CSP 完全等于基座包内置默认值（向后兼容）。
   */
  csp?: {
    /** 追加到 img-src 指令的额外来源（如 CMS 图片域名） */
    imgSrc?: string[];
    /** 追加到 script-src 指令的额外来源 */
    scriptSrc?: string[];
    /** 追加到 style-src 指令的额外来源 */
    styleSrc?: string[];
    /** 追加到 connect-src 指令的额外来源 */
    connectSrc?: string[];
    /** 追加到 font-src 指令的额外来源 */
    fontSrc?: string[];
    /** 追加到 frame-src 指令的额外来源 */
    frameSrc?: string[];
    /** 追加到 form-action 指令的额外来源 */
    formAction?: string[];
  };
}

export interface ContentConfig {
  dataDir?: string;
  contentDir?: string;
}

export interface FooterConfig {
  /**
   * 是否在页脚显示隐私政策 / 服务条款链接。默认 true。
   *
   * 注意：当站点开启了任何分析工具（GA4 / Microsoft Clarity / 百度统计）时，
   * 出于《个人信息保护法》合规要求，该值会被**强制视为 true**，无法关闭。
   * 仅在未开启分析工具的纯展示站上，可显式设为 false 隐藏这些链接。
   */
  legalLinks?: boolean;
  /** 隐私政策链接路径，默认 '/privacy' */
  privacyHref?: string;
  /** 服务条款链接路径，默认 '/terms' */
  termsHref?: string;

  // ── 页脚品牌区增强（可选） ──

  /** 是否在页脚品牌区显示联系信息（从 site.contact 读取） */
  showContact?: boolean;
  /**
   * 联系信息的排列方向。
   * - 'vertical'（默认）：竖直堆叠，适合信息较多或空间充裕的场景
   * - 'horizontal'：横向排列，适合紧凑布局
   */
  contactLayout?: 'vertical' | 'horizontal';
  /**
   * 社交链接配置（配置驱动，替代 showSocial + siteConfig.social 的硬编码方式）。
   * 每项支持：内置图标名 / 自定义 SVG / 图片图标 / 二维码悬浮。
   * 设置后 showSocial 自动启用，无需额外开关。
   */
  socialLinks?: SocialLink[];
  /**
   * 二维码卡片列表 — 直接在页脚显示二维码图片（非 hover 弹窗）。
   * 适合放微信、企业微信等需要用户主动扫码的联系方式。
   */
  qrCards?: QrCard[];
}

/**
 * 社交链接项 — 支持三种图标模式和可选二维码悬浮。
 */
export interface SocialLink {
  /** 平台名称（用于 aria-label 和内置图标匹配） */
  name: string;
  /** 链接地址（二维码类型可不填） */
  href?: string;
  /**
   * 图标来源（三选一，按优先级）：
   * 1. 图片路径：如 '/icons/wechat.svg' 或 '/images/douyin.png'
   * 2. 内置图标名：'github' | 'twitter' | 'linkedin' | 'zhihu' | 'weibo' | 'bilibili' | 'douyin' | 'xiaohongshu' | 'wechat'
   * 3. 自定义 SVG path：以 'M' 开头的 SVG path data
   * 不填则显示 name 首字母圆形图标
   */
  icon?: string;
  /** 二维码图片路径（如 '/images/wechat-qr.png'），hover 时弹出显示 */
  qrCode?: string;
  /** 二维码弹窗标题（默认显示 name） */
  qrLabel?: string;
}

/**
 * 二维码卡片 — 直接在页脚展示二维码图片，带标签和描述。
 */
export interface QrCard {
  /** 标签，如 "微信" / "企业微信" */
  label: string;
  /** 二维码图片路径，如 '/images/wechat-qr.png' */
  image: string;
  /** 可选描述文字，如 "扫码加微信" */
  description?: string;
}

/**
 * 悬浮侧边栏配置 — 右侧固定操作按钮组。
 */
export interface FloatingSidebarConfig {
  /** 按钮列表，按顺序从上到下排列 */
  items: FloatingItem[];
  /** 是否显示回到顶部按钮（滚动后出现），默认 true */
  showBackToTop?: boolean;
  /** 是否仅在桌面端显示，默认 true（移动端通常用底部 CTA 栏替代） */
  desktopOnly?: boolean;
  /**
   * 二维码列表 — 点击"扫码联系"按钮后在侧边弹出展示面板。
   * 复用 QrCard 接口（label + image + description），适合放微信、企业微信、公众号等二维码。
   */
  qrCodes?: QrCard[];
}

/**
 * 悬浮按钮项 — 支持内置图标名或自定义 SVG path。
 */
export interface FloatingItem {
  /** 按钮标签文字 */
  label: string;
  /**
   * 图标：内置名 ('proposal' | 'chat' | 'phone' | 'wechat' | 'arrow-up')
   * 或以 'M' 开头的 SVG path data。不填则不显示图标。
   */
  icon: string;
  /** 点击跳转链接，如 '/contact' 或外部 URL */
  href?: string;
  /** 外链时自动添加 target="_blank" */
  external?: boolean;
  /**
   * 点击后弹出气泡显示的文字（如电话号码、微信号），替代 href 跳转。
   * 设置后 href 失效，按钮变为点击弹 tooltip 模式。
   */
  value?: string;
}

export interface ComponentOverrides {
  header?: string;
  footer?: string;
  layout?: string;
}

/**
 * 增长合作伙伴卡片配置 — 驱动 GrowthPartnerCard 组件。
 *
 * 通过 dfgrow.config.ts 中的 `growthPartner` 字段注入，使所有 UTM 参数
 * 与文案均可按客户/项目维度配置，避免硬编码。
 *
 * 例：
 * ```ts
 * growthPartner: {
 *   utm: { source: 'myclient', medium: 'referral' },
 *   primaryHref: 'https://dfgrow.com/',
 *   secondaryHref: 'https://dfgrow.com/services',
 * }
 * ```
 */
export interface GrowthPartnerConfig {
  /**
   * UTM 跟踪参数。
   * - `source`：流量来源标识，默认 'sczhiyu'
   * - `medium`：流量媒介，默认 'referral'（GrowthPartnerCard 场景）
   * - `footerMedium`：页脚链接专用 medium，默认 'footer'
   * - `campaignPrefix`：campaign 前缀，最终拼接为 `${campaignPrefix}_${placement}_partner_promo`，
   *   默认前缀为空（即 campaign 为 `${placement}_partner_promo`）。
   *   若需保留旧行为 campaign='about_partner_promo'，可不配置此项。
   */
  utm?: {
    source?: string;
    medium?: string;
    footerMedium?: string;
    campaignPrefix?: string;
  };
  /** 主推链接基础地址（不含 UTM，组件会自动拼接），默认 'https://dfgrow.com/' */
  primaryHref?: string;
  /** 次推链接基础地址（不含 UTM），默认 'https://dfgrow.com/services' */
  secondaryHref?: string;
  /** about 场景次推链接覆盖，默认复用 secondaryHref */
  aboutSecondaryHref?: string;
  /** cases 场景次推链接覆盖，默认 'https://dfgrow.com/method' */
  casesSecondaryHref?: string;
  /** 主推按钮文案，默认 '了解登峰增长' */
  primaryLabel?: string;
  /** 次推按钮文案，默认 '查看方法与服务' */
  secondaryLabel?: string;
  /**
   * 是否在链接上追加 UTM 参数。
   * 设为 false 可完全关闭 UTM 拼接，仅使用原始链接。默认 true。
   */
  appendUtm?: boolean;
  /**
   * 卡片最外层背景色（CSS 颜色值，如 '#0a0a0a'、'rgb(10,10,10)'）。
   * 用于适配深色等特殊主题的客户网站。
   * 不配置时保持默认（浅蓝渐变）背景。
   */
  backgroundColor?: string;

  // ── 页脚「官网由登峰增长搭建」致谢区块 ──

  /**
   * 是否在页脚展示「官网由登峰增长搭建」致谢区块。
   * - `true`：展示（需客户同意）
   * - `false`：完全不渲染该区块
   * 默认 false，避免在客户未授权时默认展示。
   */
  footerCredit?: boolean;
  /** 页脚致谢链接的基础地址（不含 UTM），默认复用 primaryHref */
  footerCreditHref?: string;
  /** 页脚致谢链接文字，默认 '登峰增长' */
  footerCreditLabel?: string;
  /** 页脚致谢前缀文案，默认 '官网由' */
  footerCreditPrefix?: string;
  /** 页脚致谢后缀文案，默认 '搭建及提供SEO/GEO优化支持。' */
  footerCreditSuffix?: string;
}

export interface DfgrowConfig {
  site: SiteConfig;
  nav: NavConfig;
  theme?: DfgrowTheme;
  analytics?: AnalyticsConfig;
  seo?: SeoConfig;
  i18n?: I18nConfig;
  cta?: CtaConfig;
  speculation?: SpeculationConfig;
  security?: SecurityConfig;
  content?: ContentConfig;
  footer?: FooterConfig;
  floatingSidebar?: FloatingSidebarConfig;
  growthPartner?: GrowthPartnerConfig;
  overrides?: ComponentOverrides;
}


// ── Universal Content Types ───────────────────────────
// 所有企业网站都会用到的通用数据结构
// 行业/客户特有的数据结构（如三段叙事、套餐方案等）由各客户项目自行定义

/** FAQ 分类 */
export type FaqCategory = string;

/** FAQ 条目 */
export interface FaqItem {
  category: FaqCategory;
  question: string;
  answer: string;
}

/** FAQ 分类元信息 */
export interface FaqCategoryMeta {
  title: string;
  description: string;
}

/** 博客文章前置元数据 */
export interface BlogPostFrontmatter {
  title: string;
  description: string;
  pubDate: Date | string;
  updatedDate?: Date | string;
  tags?: string[];
  cover?: string;
  coverAlt?: string;
  draft?: boolean;
  author?: string;
  locale?: string;
  featured?: boolean;
  faq?: Array<{ question: string; answer: string }>;
}

