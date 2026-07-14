/**
 * robots.txt Generator with AI Crawler Allowlist
 *
 * Generates robots.txt that explicitly allows AI crawlers (GEO optimization)
 * while blocking common non-content paths.
 *
 * @module generate-robots
 */

/**
 * AI crawlers to explicitly allow — these are the 13 major AI/LLM crawlers.
 * Explicit Allow rules ensure AI platforms can access and index the site.
 */
const AI_CRAWLERS = [
  'GPTBot',           // OpenAI
  'CCBot',             // Common Crawl (used by many AI models)
  'Claude-Web',        // Anthropic
  'PerplexityBot',     // Perplexity
  'Amazonbot',         // Amazon
  'meta-externalagent',// Meta
  'Google-Extended',  // Google (Gemini training)
  'Bytespider',        // ByteDance
  'Baiduspider',       // Baidu
  'Sogou',             // Sogou
  '360Spider',         // 360
  'YisouSpider',       // Yisou
  'Applebot-Extended', // Apple Intelligence
];

/**
 * Paths to disallow for all crawlers.
 */
const DISALLOW_PATHS = [
  '/api/*',
  '/search*',
  '/admin/*',
  '/*?*',
  '/*utm_*',
];

/**
 * Generate robots.txt content with AI crawler allowlist.
 * @param {import('../types.js').DfgrowConfig} config
 * @returns {string}
 */
export function generateRobotsTxt(config) {
  const siteUrl = config.site.url.replace(/\/$/, '');
  const lines = [];

  // AI crawler explicit allow rules (GEO optimization)
  lines.push('# AI Crawlers — Explicitly Allowed for GEO optimization');
  for (const crawler of AI_CRAWLERS) {
    lines.push(`User-agent: ${crawler}`);
    lines.push('Allow: /');
    lines.push('');
  }

  // Regular crawlers — default rules
  lines.push('# Regular Crawlers');
  lines.push('User-agent: *');
  lines.push('Allow: /');
  for (const path of DISALLOW_PATHS) {
    lines.push(`Disallow: ${path}`);
  }
  lines.push('');

  // Crawl delay for aggressive crawlers (optional)
  lines.push('# Crawl-delay for resource management');
  lines.push('Crawl-delay: 1');
  lines.push('');

  // Sitemap
  lines.push('# Sitemap');
  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);

  return lines.join('\n') + '\n';
}
