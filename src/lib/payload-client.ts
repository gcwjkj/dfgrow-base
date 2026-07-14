/**
 * Payload CMS REST API Client
 *
 * 所有官网通过此客户端从 CMS 拉取内容。
 * 环境变量：
 *   CMS_URL      — CMS 地址，如 https://cms.example.com
 *   CMS_API_KEY  — Payload API Key（在 CMS 后台 Users 中生成）
 *   SITE_BRAND   — 当前站点品牌，如 dfgrow
 */

// ── Types ─────────────────────────────────────────

export interface PayloadBlogEntry {
  id: string
  slug: string
  title: string
  description: string
  contentHtml: string
  pubDate: string
  updatedDate?: string
  author: string
  draft: boolean
  locale: string
  section: string
  sectionLabel: string
  tags: string[]
  cover?: string
  coverAlt?: string
  featured: boolean
  /** 发布状态：draft=未发布, published=已发布 */
  status: string
  /** 发布时间 */
  publishedAt?: string
  /** Article-level FAQ for schema */
  faq?: Array<{ question: string; answer: string }>
}

export interface PayloadCaseEntry {
  id: string
  slug: string
  title: string
  company: string
  companyUrl?: string
  industry: string
  summary: string
  cover?: string
  coverAlt?: string
  contentHtml: string
  featured: boolean
  tags: string[]
}

export interface PayloadFaqEntry {
  id: string
  question: string
  answer: string
  category: string
  order: number
  featured: boolean
}

// ── Lexical → HTML ────────────────────────────────

/**
 * Minimal Payload Lexical JSON → HTML converter.
 * Handles the node types we actually use in blog posts.
 */
function lexicalToHtml(content: unknown): string {
  if (!content) return ''

  const root = (content as any)?.root
  if (!root?.children) return ''

  return serializeChildren(root.children)
}

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

function serializeChildren(children: any[]): string {
  return children.map((node) => serializeNode(node)).join('')
}

function serializeNode(node: any): string {
  if (!node) return ''

  switch (node.type) {
    case 'paragraph':
      return `<p>${serializeChildren(node.children)}</p>`

    case 'heading': {
      const tag = node.tag || 'h2'
      return `<${tag}>${serializeChildren(node.children)}</${tag}>`
    }

    case 'text': {
      let text = escapeHtml(node.text || '')
      const fmt = node.format || 0

      if (fmt & FORMAT_CODE) text = `<code>${text}</code>`
      if (fmt & FORMAT_BOLD) text = `<strong>${text}</strong>`
      if (fmt & FORMAT_ITALIC) text = `<em>${text}</em>`
      if (fmt & FORMAT_STRIKETHROUGH) text = `<s>${text}</s>`
      if (fmt & FORMAT_UNDERLINE) text = `<u>${text}</u>`

      return text
    }

    case 'link': {
      const href = escapeAttr(node.fields?.url || node.url || '#')
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${href}"${target}>${serializeChildren(node.children)}</a>`
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${serializeChildren(node.children)}</${tag}>`
    }

    case 'listitem':
      return `<li>${serializeChildren(node.children)}</li>`

    case 'quote':
      return `<blockquote>${serializeChildren(node.children)}</blockquote>`

    case 'code': {
      const lang = node.language ? ` class="language-${escapeAttr(node.language)}"` : ''
      return `<pre><code${lang}>${escapeHtml(node.children?.[0]?.text || '')}</code></pre>`
    }

    case 'horizontalrule':
      return '<hr />'

    case 'image': {
      const src = node.src || ''
      const alt = escapeAttr(node.altText || '')
      return `<img src="${escapeAttr(src)}" alt="${alt}" loading="lazy" />`
    }

    case 'upload': {
      // Payload upload node — uses value.url
      const src = node.value?.url || node.fields?.url || ''
      const alt = escapeAttr(node.value?.alt || node.fields?.alt || '')
      return `<img src="${escapeAttr(src)}" alt="${alt}" loading="lazy" />`
    }

    case 'table': {
      // Only serialize table if we haven't been provided a pre-serialized HTML field
      // If the table doesn't have children (was serialized server-side), return empty
      if (!node.children) return ''
      return `<table>${serializeChildren(node.children)}</table>`
    }

    case 'tablerow':
      return `<tr>${serializeChildren(node.children)}</tr>`

    case 'tablecell': {
      const tag = node.headerState === 1 ? 'th' : 'td'
      return `<${tag}>${serializeChildren(node.children)}</${tag}>`
    }

    case 'autolink':
    case 'linebreak':
      return '<br />'

    case 'block': {
      // Nested block (e.g., relationship block)
      return node.fields ? serializeChildren(node.fields?.content?.root?.children || []) : ''
    }

    default:
      // For unknown node types with children, still serialize children
      if (node.children?.length) return serializeChildren(node.children)
      return ''
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ── Client ────────────────────────────────────────

function getClientConfig() {
  const url = process.env.CMS_URL
  if (!url) {
    throw new Error('CMS_URL 环境变量未设置。请在 .env 中配置。')
  }
  const apiKey = process.env.CMS_API_KEY || ''
  return { url: url.replace(/\/$/, ''), apiKey }
}

async function fetchPayload(collection: string, params: URLSearchParams) {
  const { url, apiKey } = getClientConfig()
  const query = params.toString()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) {
    headers['Authorization'] = `users API-Key ${apiKey}`
  }
  const res = await fetch(`${url}/api/${collection}?${query}`, { headers })

  if (!res.ok) {
    throw new Error(
      `CMS API 请求失败: ${res.status} ${res.statusText} — ${collection}`
    )
  }

  return res.json()
}

// ── Brand ID 查找（带缓存）─────────────────────────

const brandIdCache = new Map<string, string | number>()

/**
 * 根据品牌 slug 查找品牌 ID。
 * brand 是 relationship 字段，存储的是 ID 而非 slug，
 * 因此 where 查询必须用 ID 而非 slug。
 */
async function getBrandId(slug: string): Promise<string | number | null> {
  if (brandIdCache.has(slug)) return brandIdCache.get(slug)!

  const params = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
  })

  try {
    const data = await fetchPayload('brands', params)
    const id = data.docs?.[0]?.id ?? null
    if (id != null) brandIdCache.set(slug, id)
    return id
  } catch {
    return null
  }
}

// ── Public API ─────────────────────────────────────

export interface PayloadClientOptions {
  /** Override CMS_URL (default: process.env.CMS_URL) */
  url?: string
  /** Override CMS_API_KEY (default: process.env.CMS_API_KEY) */
  apiKey?: string
}

let _configOverride: PayloadClientOptions = {}

/**
 * Set CMS client options. Call this before any fetch if not using env vars.
 */
export function configurePayloadClient(opts: PayloadClientOptions) {
  _configOverride = opts
}

/** Parse raw Payload blog doc → PayloadBlogEntry */
function parseBlog(doc: any): PayloadBlogEntry {
  return {
    id: doc.id,
    slug: doc.slug || doc.id,
    title: doc.title || '',
    description: doc.description || '',
    contentHtml: lexicalToHtml(doc.content),
    pubDate: doc.pubDate,
    updatedDate: doc.updatedDate || undefined,
    author: doc.author || '登峰增长',
    draft: doc.draft ?? false,
    locale: doc.locale || 'zh',
    section: doc.section || 'search',
    sectionLabel: doc.sectionLabel || '',
    tags: doc.tags?.map((t: any) => (typeof t === 'string' ? t : t.tag)) || [],
    cover: doc.cover && typeof doc.cover === 'object' ? (doc.cover as any).url : undefined,
    coverAlt: doc.coverAlt || undefined,
    featured: doc.featured ?? false,
    faq: doc.faq || undefined,
    status: doc.status || 'draft',
    publishedAt: doc.publishedAt || undefined,
  }
}

/** Parse raw Payload case doc → PayloadCaseEntry */
function parseCase(doc: any): PayloadCaseEntry {
  return {
    id: doc.id,
    slug: doc.slug || doc.id,
    title: doc.title || '',
    company: doc.company || '',
    companyUrl: doc.companyUrl || undefined,
    industry: doc.industry || '',
    summary: doc.summary || doc.description || '',
    cover: doc.cover && typeof doc.cover === 'object' ? (doc.cover as any).url : undefined,
    coverAlt: doc.coverAlt || undefined,
    contentHtml: lexicalToHtml(doc.content),
    featured: doc.featured ?? false,
    tags: doc.tags?.map((t: any) => (typeof t === 'string' ? t : t.tag)) || [],
  }
}

/** Parse raw Payload FAQ doc → PayloadFaqEntry */
function parseFaq(doc: any): PayloadFaqEntry {
  return {
    id: doc.id,
    question: doc.question || '',
    answer: doc.answer || '',
    category: doc.category || 'fit',
    order: doc.order ?? 99,
    featured: doc.featured ?? false,
  }
}

/**
 * Fetch blog posts from CMS.
 * @param brand - Brand filter. Default reads SITE_BRAND env var.
 */
export async function fetchBlogs(brand?: string): Promise<PayloadBlogEntry[]> {
  const siteBrand = brand || process.env.SITE_BRAND || ''

  // brand 是 relationship 字段，需先查 ID 再用 ID 过滤
  let brandFilter: Record<string, unknown> | null = null
  if (siteBrand) {
    const brandId = await getBrandId(siteBrand)
    if (brandId == null) {
      console.warn(`[fetchBlogs] 未找到品牌 "${siteBrand}"，返回空列表`)
      return []
    }
    brandFilter = { brand: { equals: brandId } }
  }

  const params = new URLSearchParams({
    depth: '2',
    limit: '200',
    sort: '-pubDate',
    where: JSON.stringify({
      and: [
        { status: { equals: 'published' } },
        ...(brandFilter ? [brandFilter] : []),
      ],
    }),
  })

  const data = await fetchPayload('blog', params)

  return (data.docs || []).map(parseBlog)
}

/**
 * Fetch case studies from CMS.
 */
export async function fetchCases(brand?: string): Promise<PayloadCaseEntry[]> {
  const siteBrand = brand || process.env.SITE_BRAND || ''

  let brandFilter: Record<string, unknown> | null = null
  if (siteBrand) {
    const brandId = await getBrandId(siteBrand)
    if (brandId == null) {
      console.warn(`[fetchCases] 未找到品牌 "${siteBrand}"，返回空列表`)
      return []
    }
    brandFilter = { brand: { equals: brandId } }
  }

  const params = new URLSearchParams({
    depth: '2',
    limit: '200',
    where: JSON.stringify(brandFilter || {}),
  })

  const data = await fetchPayload('case-studies', params)
  return (data.docs || []).map(parseCase)
}

/**
 * Fetch FAQs from CMS.
 */
export async function fetchFaqs(brand?: string): Promise<PayloadFaqEntry[]> {
  const siteBrand = brand || process.env.SITE_BRAND || ''

  let brandFilter: Record<string, unknown> | null = null
  if (siteBrand) {
    const brandId = await getBrandId(siteBrand)
    if (brandId == null) {
      console.warn(`[fetchFaqs] 未找到品牌 "${siteBrand}"，返回空列表`)
      return []
    }
    brandFilter = { brand: { equals: brandId } }
  }

  const params = new URLSearchParams({
    depth: '1',
    limit: '200',
    sort: 'order',
    where: JSON.stringify({
      ...(brandFilter || {}),
      status: { equals: 'published' },
    }),
  })

  const data = await fetchPayload('faqs', params)
  return (data.docs || []).map(parseFaq)
}
