/**
 * 通用内容集合 Zod Schema
 *
 * 供客户项目在 content.config.ts 中复用：
 *   import { blogPostSchema } from '@gcwjkj/dfgrow-base/lib/content-schemas';
 *
 * 使用方式（需 z from 'astro:content' 或 'zod'）：
 *   const blog = defineCollection({
 *     loader: glob({ pattern: '.mdx', base: './src/content/blog' }),
 *     schema: blogPostSchema(z),
 *   });
 */

/**
 * 博客文章 schema 工厂
 * 接收 z（zod 实例），返回 schema，避免对特定 zod 版本的硬依赖
 */
export function blogPostSchema(z: any) {
  return z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    author: z.string().default('登峰增长'),
    locale: z.string().default('zh'),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  });
}
