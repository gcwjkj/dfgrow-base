/**
 * Astro Content Loader — Payload CMS Blog
 *
 * 替换 content.config.ts 中的 glob() loader，
 * 让 getCollection('blog') 从 CMS API 拉取数据。
 *
 * 使用方式：
 *   import { payloadBlogLoader } from '@gcwjkj/dfgrow-base/lib/payload-loader';
 *   const blog = defineCollection({ loader: payloadBlogLoader(), schema: ... });
 */

import { fetchBlogs } from './payload-client'

export interface PayloadBlogLoaderOptions {
  /** Brand filter. Default reads SITE_BRAND env var. */
  brand?: string
}

export function payloadBlogLoader(opts: PayloadBlogLoaderOptions = {}) {
  return {
    name: 'payload-blog-loader',

    load: async ({ store, logger, parseData, generateDigest }: {
      store: { set: (entry: any) => void }
      logger: { info: (msg: string) => void; error: (msg: string) => void }
      parseData: (entry: { id: string; data: Record<string, unknown> }) => Promise<any>
      generateDigest: (data: unknown) => string
    }) => {
      logger.info(
        `正在从 CMS 拉取博客文章… (brand=${opts.brand || process.env.SITE_BRAND || '未设置'})`
      )

      let entries
      try {
        entries = await fetchBlogs(opts.brand)
      } catch (err) {
        logger.error(`CMS 博客拉取失败: ${(err as Error).message}`)
        return
      }

      logger.info(`拉取到 ${entries.length} 篇博客文章`)

      for (const entry of entries) {
        // Use slug as the content entry ID (matches [...slug].astro routing)
        const id = entry.slug || entry.id

        // The body field stores the rendered HTML for calcReadingTime etc.
        const body = entry.contentHtml || ''

        // Build the data shape matching the existing blog schema
        const data = await parseData({
          id,
          data: {
            title: entry.title,
            description: entry.description,
            pubDate: new Date(entry.pubDate),
            updatedDate: entry.updatedDate ? new Date(entry.updatedDate) : undefined,
            tags: entry.tags || [],
            cover: entry.cover,
            coverAlt: entry.coverAlt,
            draft: entry.draft,
            author: entry.author || '登峰增长',
            locale: entry.locale || 'zh',
            faq: entry.faq,
            // New publish status fields
            status: entry.status || 'draft',
            publishedAt: entry.publishedAt || undefined,
            // Extra fields from CMS (not in original schema but handy)
            section: entry.section,
            sectionLabel: entry.sectionLabel,
            featured: entry.featured,
          },
        })

        const digest = generateDigest({ ...data, body })

        store.set({
          id,
          data,
          body,
          digest,
          rendered: {
            html: body,
          },
        })
      }
    },
  }
}
