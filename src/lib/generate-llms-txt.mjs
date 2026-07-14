/**
 * llms.txt / llms-full.txt Generator
 *
 * Generates AI-friendly site description files for LLM crawlers.
 * - llms.txt: concise summary (title, description, key links)
 * - llms-full.txt: full entity graph with all pages, services, contact info
 *
 * @module generate-llms-txt
 */

/**
 * Generate llms.txt content — concise site summary for AI crawlers.
 * @param {import('../types.js').DfgrowConfig} config
 * @returns {string}
 */
export function generateLlmsTxt(config) {
  const { site, nav } = config;
  const pages = site.websitePages ?? [];

  let content = `# ${site.name}\n\n`;
  content += `> ${site.tagline}\n\n`;
  content += `${site.description}\n\n`;

  // Key pages
  if (pages.length > 0) {
    content += `## 重要页面\n\n`;
    for (const page of pages) {
      content += `- [${page.name}](${site.url}${page.path}): ${page.description}\n`;
    }
    content += `\n`;
  }

  // Contact
  content += `## 联系方式\n\n`;
  content += `- 邮箱: ${site.contact.email}\n`;
  if (site.contact.phone) content += `- 电话: ${site.contact.phone}\n`;
  if (site.contact.wechat) content += `- 微信: ${site.contact.wechat}\n`;
  content += `\n`;

  // Sitemap
  content += `## Links\n\n`;
  content += `- [Website](${site.url})\n`;
  content += `- [Sitemap](${site.url}/sitemap.xml)\n`;

  return content;
}

/**
 * Generate llms-full.txt content — full entity graph for AI consumption.
 * @param {import('../types.js').DfgrowConfig} config
 * @returns {string}
 */
export function generateLlmsFullTxt(config) {
  const { site, nav } = config;
  const pages = site.websitePages ?? [];

  let content = `# ${site.name} — Full Site Description\n\n`;

  // Organization entity
  content += `## Organization\n\n`;
  content += `- Name: ${site.name}\n`;
  if (site.nameEn) content += `- Name (EN): ${site.nameEn}\n`;
  content += `- URL: ${site.url}\n`;
  content += `- Domain: ${site.domain}\n`;
  content += `- Tagline: ${site.tagline}\n`;
  content += `- Description: ${site.description}\n`;
  content += `- Founded: ${site.foundingYear}\n`;
  content += `- Industry: ${site.industry}\n`;
  content += `- Area Served: ${site.areaServed}\n`;
  content += `- Price Range: ${site.priceRange} ${site.priceCurrency}\n`;
  content += `- Locale: ${site.locale}\n`;
  if (site.legalEntity) {
    content += `- Legal Entity: ${site.legalEntity.name}\n`;
    if (site.legalEntity.shortName) content += `- Short Name: ${site.legalEntity.shortName}\n`;
    if (site.legalEntity.creditCode) content += `- Credit Code: ${site.legalEntity.creditCode}\n`;
  }
  content += `\n`;

  // Address
  content += `## Address\n\n`;
  content += `- Country: ${site.address.country}\n`;
  content += `- Locality: ${site.address.locality}\n`;
  content += `\n`;

  // Founder
  content += `## Founder\n\n`;
  content += `- Name: ${site.founder.name}\n`;
  content += `- Title: ${site.founder.title}\n`;
  if (site.founder.university) content += `- University: ${site.founder.university}\n`;
  content += `\n`;

  // Contact
  content += `## Contact\n\n`;
  content += `- Email: ${site.contact.email}\n`;
  if (site.contact.phone) content += `- Phone: ${site.contact.phone}\n`;
  if (site.contact.wechat) content += `- WeChat: ${site.contact.wechat}\n`;
  if (site.social) {
    content += `\n### Social Links\n\n`;
    for (const [platform, url] of Object.entries(site.social)) {
      if (url) content += `- ${platform}: ${url}\n`;
    }
  }
  content += `\n`;

  // Pages
  if (pages.length > 0) {
    content += `## Website Pages\n\n`;
    for (const page of pages) {
      content += `### ${page.name}\n\n`;
      content += `- URL: ${site.url}${page.path}\n`;
      content += `- Description: ${page.description}\n\n`;
    }
  }

  // Navigation structure
  content += `## Navigation Structure\n\n`;
  content += `### Main Navigation\n\n`;
  for (const item of nav.main) {
    content += `- [${item.label}](${site.url}${item.href})\n`;
    if (item.children) {
      for (const child of item.children) {
        content += `  - [${child.label}](${site.url}${child.href})\n`;
      }
    }
  }
  content += `\n`;

  // Footer navigation
  content += `### Footer — Services\n\n`;
  for (const item of nav.footer.services) {
    content += `- [${item.label}](${site.url}${item.href})\n`;
  }
  content += `\n### Footer — Company\n\n`;
  for (const item of nav.footer.company) {
    content += `- [${item.label}](${site.url}${item.href})\n`;
  }
  content += `\n### Footer — Resources\n\n`;
  for (const item of nav.footer.resources) {
    content += `- [${item.label}](${site.url}${item.href})\n`;
  }

  // CTA
  content += `\n## Call to Action\n\n`;
  content += `- [${nav.cta.label}](${site.url}${nav.cta.href})\n`;

  // ICP (if applicable)
  if (site.beian?.icp) {
    content += `\n## ICP Registration\n\n`;
    content += `- ICP Number: ${site.beian.icp}\n`;
    if (site.beian.icpUrl) content += `- Verification URL: ${site.beian.icpUrl}\n`;
  }

  // Sitemap reference
  content += `\n## Machine-Readable Resources\n\n`;
  content += `- Sitemap: ${site.url}/sitemap.xml\n`;
  content += `- Robots: ${site.url}/robots.txt\n`;
  content += `- RSS: ${site.url}/rss.xml\n`;

  return content;
}
