/**
 * 博客文章查询与渲染封装
 *
 * 屏蔽 astro 大版本间的内容 API 差异（slug/id、render()），让客户站代码不用关心底层变更。
 *
 * 用法：
 *   import { getBlogPosts, renderPost } from '@gcwjkj/dfgrow-base/lib/blog';
 *
 *   const posts = await getBlogPosts();           // 每篇 post 统一带 .slug
 *   const { Content } = await renderPost(post);   // 统一渲染入口
 */

import { getCollection, render } from 'astro:content';

/**
 * 统一的博客文章类型。
 * 在 astro 原生 CollectionEntry 之上补充 .slug，屏蔽 id/slug 版本差异。
 */
export interface BlogPost {
  id: string;
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    updatedDate?: Date;
    tags: string[];
    cover?: string;
    coverAlt?: string;
    draft: boolean;
    author: string;
    locale: string;
    featured: boolean;
    faq?: Array<{ question: string; answer: string }>;
    [key: string]: unknown;
  };
  body: string;
  collection: string;
  render: () => Promise<{ Content: any; headings: any[]; remarkPluginFrontmatter: Record<string, any> }>;
}

/**
 * 获取所有博客文章，统一返回带 .slug 的 BlogPost。
 *
 * - astro 5: slug 来自原生 post.slug
 * - astro 6+: glob loader 无 slug，用 id 代替（id 即文件名去扩展名，等价于旧 slug）
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.map((post: any) => ({
    ...post,
    // astro 5 有 post.slug，astro 6+ 用 post.id；两者取其一
    slug: post.slug ?? post.id,
  })) as BlogPost[];
}

/**
 * 渲染博客文章，返回 Content 组件。
 *
 * - astro 5: post.render()
 * - astro 6+: render(post)
 */
export async function renderPost(post: BlogPost): Promise<{ Content: any; headings: any[]; remarkPluginFrontmatter: Record<string, any> }> {
  // astro 6+ 的 render 是从 astro:content 导入的函数
  // astro 5 的 post.render() 是实例方法
  // 这里优先用 astro 6+ 的 render(post)，回退到 post.render()
  if (typeof render === 'function') {
    return render(post as any);
  }
  return (post as any).render();
}
