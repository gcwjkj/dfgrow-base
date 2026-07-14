/**
 * PWA Manifest Generator
 *
 * Generates manifest.json from site configuration for PWA support.
 *
 * @module generate-manifest
 */

/**
 * Generate manifest.json content from site config.
 * @param {import('../types.js').DfgrowConfig} config
 * @returns {string} JSON string
 */
export function generateManifest(config) {
  const { site, theme } = config;
  const brandColor = theme?.brandColor ?? '#1f44d6';

  const manifest = {
    name: site.name,
    short_name: site.name.length > 12 ? site.name.slice(0, 12) : site.name,
    description: site.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: brandColor,
    orientation: 'portrait-primary',
    scope: '/',
    lang: site.locale,
    icons: [
      { src: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { src: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    shortcuts: (site.websitePages ?? []).slice(0, 4).map((page) => ({
      name: page.name,
      short_name: page.name.length > 12 ? page.name.slice(0, 12) : page.name,
      url: page.path,
      description: page.description,
    })),
    categories: [site.industry],
  };

  return JSON.stringify(manifest, null, 2);
}
