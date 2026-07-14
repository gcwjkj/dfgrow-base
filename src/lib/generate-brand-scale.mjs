/**
 * Brand Color Scale Generator
 *
 * Generates a full 50~950 color palette from a single hex brand color.
 * Used at build time to auto-generate --df-brand-* CSS variables,
 * so consumers only need to set `theme.brandColor` in dfgrow.config.ts.
 *
 * @module generate-brand-scale
 */

/**
 * @param {string} hex - Base brand color, e.g. '#25b1da'
 * @returns {Record<string, string>} Map of scale level to hex color
 */
export function generateBrandScale(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Convert to HSL
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1: h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) / 6; break;
      case g1: h = ((b1 - r1) / d + 2) / 6; break;
      case b1: h = ((r1 - g1) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  const H = h * 360, S = s * 100;

  // Scale definition: [level, targetLightness, saturationAdjust]
  // The 600 level is the base color; others are computed by adjusting lightness/saturation.
  const steps = [
    ['50',  96, -20],
    ['100', 88, -10],
    ['200', 78,  -5],
    ['300', 66,   0],
    ['400', 56,   2],
    ['500', 50,   3],
    ['600', -1,   0],  // sentinel: use original base color
    ['700', 38,  -2],
    ['800', 30,  -5],
    ['900', 22,  -8],
    ['950', 14, -12],
  ];

  const scale = {};

  for (const [key, targetL, sAdj] of steps) {
    if (targetL < 0) {
      // Use base color for 600
      scale[key] = '#' + hex;
    } else {
      const newS = Math.max(0, Math.min(100, S + sAdj));
      const rgb = hslToRgb(H, newS, targetL);
      scale[key] = rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  }

  return scale;
}

/**
 * Generate CSS :root block from a brand color hex.
 * @param {string} hex
 * @returns {string} CSS text
 */
export function generateBrandCSS(hex) {
  const scale = generateBrandScale(hex);
  const lines = Object.entries(scale)
    .map(([k, v]) => `  --df-brand-${k.padEnd(3)}: ${v};`)
    .join('\n');
  return `:root {\n${lines}\n}`;
}

// ---- helpers ----

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0'))
    .join('');
}
