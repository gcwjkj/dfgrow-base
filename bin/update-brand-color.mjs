#!/usr/bin/env node

/**
 * dfgrow-update-brand-color
 *
 * One-command brand color update for dfgrow-base projects.
 * Updates dfgrow.config.ts with the new brandColor and rebuilds the site.
 *
 * Usage:
 *   npx dfgrow-update-brand-color <hex-color> [project-dir]
 *
 * Examples:
 *   npx dfgrow-update-brand-color '#25b1da'
 *   npx dfgrow-update-brand-color '#177f9a' /path/to/project
 *   npx dfgrow-update-brand-color '#25b1da' --no-build
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';

// ---- Parse args ----
const args = process.argv.slice(2);
let hexColor = null;
let projectDir = '.';
let skipBuild = false;

for (const arg of args) {
  if (arg === '--no-build') {
    skipBuild = true;
  } else if (arg.startsWith('#') || arg.match(/^[0-9a-fA-F]{6}$/)) {
    hexColor = arg.startsWith('#') ? arg.toLowerCase() : '#' + arg.toLowerCase();
  } else if (arg !== '--help' && arg !== '-h') {
    projectDir = arg;
  }
}

if (!hexColor || args.includes('--help') || args.includes('-h')) {
  console.log(`
  dfgrow-update-brand-color

  Usage:
    npx dfgrow-update-brand-color <hex-color> [project-dir] [options]

  Arguments:
    hex-color     Brand color in hex format (e.g. #25b1da or 25b1da)
    project-dir   Project root directory (default: current directory)

  Options:
    --no-build    Update config only, skip npm run build
    --help, -h    Show this help

  Examples:
    npx dfgrow-update-brand-color '#25b1da'
    npx dfgrow-update-brand-color '#177f9a' /path/to/project
    npx dfgrow-update-brand-color '#25b1da' --no-build
  `);
  process.exit(hexColor ? 0 : 1);
}

// ---- Validate hex ----
if (!/^#[0-9a-f]{6}$/.test(hexColor)) {
  console.error(`Error: Invalid hex color "${hexColor}". Expected format: #rrggbb`);
  process.exit(1);
}

// ---- Resolve project directory ----
const absDir = resolve(projectDir);
const configPath = join(absDir, 'dfgrow.config.ts');

if (!existsSync(configPath)) {
  console.error(`Error: dfgrow.config.ts not found at ${configPath}`);
  process.exit(1);
}

// ---- Read and update config ----
let content = readFileSync(configPath, 'utf-8');

// Match brandColor: '#hex' or brandColor: "#hex" (with optional trailing comma/whitespace)
const brandColorRegex = /brandColor:\s*['"]#[0-9a-fA-F]{6}['"]/i;

if (!brandColorRegex.test(content)) {
  console.error('Error: brandColor not found in dfgrow.config.ts');
  console.error('Expected format: brandColor: \'#hexcolor\'');
  process.exit(1);
}

// Extract old color for logging
const oldMatch = content.match(brandColorRegex);
const oldColor = oldMatch[0].match(/#([0-9a-fA-F]{6})/i)?.[0] ?? 'unknown';

// Replace with new color (preserve quote style)
content = content.replace(brandColorRegex, (match) => {
  const quote = match.includes("'") ? "'" : '"';
  return `brandColor: ${quote}${hexColor}${quote}`;
});

writeFileSync(configPath, content, 'utf-8');

console.log(`  brandColor: ${oldColor} → ${hexColor}`);
console.log(`  Updated: ${configPath}`);

// ---- Build ----
if (!skipBuild) {
  console.log('\n  Building site...');
  try {
    execSync('npm run build', {
      cwd: absDir,
      stdio: 'inherit',
      timeout: 120000,
    });
    console.log('\n  Build complete!');
  } catch (err) {
    console.error('\n  Build failed. Config was updated, you can retry manually with: npm run build');
    process.exit(1);
  }
} else {
  console.log('\n  Skipped build (--no-build). Run "npm run build" to apply changes.');
}
