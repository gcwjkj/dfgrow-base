/**
 * RSS Feed Generator
 *
 * Generates RSS 2.0 XML feed from sitemap or content collections.
 * Supports two modes:
 * 1. Auto-generate from sitemap.xml (default — works without content collections)
 * 2. Accept explicit items (for content collection integration)
 *
 * @module generate-rss
 */

/**
 * RSS feed item structure.
 * @typedef {Object} RssItem
 * @property {string} title - Item title
 * @property {string} link - Full URL
 * @property {string} description - Item description
 * @property {Date} [pubDate] - Publication date
 */

/**
 * Generate RSS 2.0 XML feed.
 * @param {import('../types.js').DfgrowConfig} config
 * @param {RssItem[]} [items] - Optional explicit items; if omitted, generates from site pages
 * @returns {string} RSS XML string
 */
export function generateRssFeed(config, items = []) {
  const { site } = config;
  const siteUrl = site.url.replace(/\/$/, '');
  const buildDate = new Date().toUTCString();

  // If no explicit items, generate from websitePages
  const feedItems = items.length > 0
    ? items
    : (site.websitePages ?? []).map((page) => ({
        title: page.name,
        link: `${siteUrl}${page.path}`,
        description: page.description,
        pubDate: undefined,
      }));

  // XML escape helper
  const esc = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const itemsXml = feedItems.map((item) => {
    const pubDate = item.pubDate ? new Date(item.pubDate).toUTCString() : '';
    return `    <item>
      <title>${esc(item.title)}</title>
      <link>${esc(item.link)}</link>
      <description>${esc(item.description)}</description>
      <guid isPermaLink="true">${esc(item.link)}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${siteUrl}</link>
    <description>${esc(site.description)}</description>
    <language>${site.locale}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}
