/**
 * 博客内容集合工厂
 *
 * 封装 glob loader + schema，让客户站的 content.config.ts 简化为：
 *
 *   import { z } from 'astro:content';
 *   import { createBlogCollection } from '@gcwjkj/dfgrow-base/lib/blog-collection';
 *   export const collections = { blog: createBlogCollection({ z }) };
 *
 * 支持 schema 扩展，适配各站定制字段。
 * z 由调用方传入（来自 astro:content），避免依赖包内部无法 import 虚拟模块的问题。
 */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogPostSchema } from './content-schemas.js';

export interface CreateBlogCollectionOptions {
  /** zod 实例，来自客户站 astro:content 的 z 导出（必需） */
  z: any;
  /** markdown 文件根目录，默认 './src/content/blog' */
  base?: string;
  /** 文件匹配模式，默认匹配所有 md 和 mdx 文件 */
  pattern?: string;
  /**
   * schema 扩展钩子。接收 z 和默认 schema，返回自定义 schema。
   * 用于添加站点专属字段或调整约束。
   *
   * @example
   * // 让 description 必须在 50-200 字之间
   * extendSchema: (z, schema) => schema.extend({
   *   description: z.string().min(50).max(200),
   * })
   */
  extendSchema?: (z: any, schema: ReturnType<typeof blogPostSchema>) => any;
}

export function createBlogCollection(options: CreateBlogCollectionOptions) {
  const {
    z,
    base = './src/content/blog',
    pattern = '**/*.{md,mdx}',
    extendSchema,
  } = options;

  const baseSchema = blogPostSchema(z);
  const schema = extendSchema ? extendSchema(z, baseSchema) : baseSchema;

  return defineCollection({
    loader: glob({ pattern, base }),
    schema,
  });
}
