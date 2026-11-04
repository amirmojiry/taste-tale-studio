import { readFile, access, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
const js = await readFile(resolve(root, 'script.js'), 'utf8');
const gallery = JSON.parse(await readFile(resolve(root, 'scripts/gallery.json'), 'utf8'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One page heading is required');
assert.match(html, /<html lang="en">/, 'English document language is required');
assert.equal((html.match(/class="creation"/g) || []).length, gallery.length, 'All gallery items must exist in static HTML');
assert.equal(gallery.length, 19, 'All supplied photographs must be included');
assert.equal(new Set(gallery.map((item) => item.slug)).size, gallery.length, 'Gallery slugs must be unique');
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const path = match[1];
  if (/^https?:/.test(path)) continue;
  if (path.startsWith('#')) { if (path.length > 1) assert(ids.includes(path.slice(1)), `Missing anchor ${path}`); continue; }
  assert(!path.startsWith('/'), `Use relative assets for GitHub project Pages: ${path}`);
  await access(resolve(root, path));
}
for (const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) await access(resolve(root, match[1]));
for (const match of html.matchAll(/srcset="([^"]+)"/g)) for (const entry of match[1].split(',')) await access(resolve(root, entry.trim().split(/\s+/)[0]));
for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
  assert(/\balt="[^"]*"/.test(match[1]), 'Every image needs alt text or an explicit decorative alt');
  assert(/\bwidth="\d+"/.test(match[1]) && /\bheight="\d+"/.test(match[1]), 'Image dimensions prevent layout shifts');
}
for (const match of html.matchAll(/<a\b([^>]+)>/g)) {
  if (match[1].includes('target="_blank"')) assert(match[1].includes('rel="noopener noreferrer"'), 'External new tabs must be isolated');
}
for (const category of ['all', 'savoury', 'sweet', 'butter']) {
  const count = category === 'all' ? gallery.length : gallery.filter((item) => item.category === category).length;
  const button = html.match(new RegExp(`data-filter="${category}"[^>]*>[\\s\\S]*?<sup>(\\d+)</sup>`));
  assert.equal(Number(button?.[1]), count, `Category count must match ${category}`);
}
assert.match(html, /mini-burgers-960\.webp 720w/, 'Responsive image descriptors must match the actual width');
assert.match(css, /prefers-reduced-motion:reduce/, 'Reduced motion is required');
assert(!/eval\(|new Function\(|document\.write\(/.test(js), 'No dynamic code execution');
assert(!/https?:\/\//.test(css), 'Fonts and styles must remain self-hosted');
assert(gzipSync(js).length < 6000, 'JavaScript gzip budget is 6 KB');
assert(gzipSync(css).length < 9000, 'CSS gzip budget is 9 KB');
const imageFiles = await readdir(resolve(root, 'assets/images'));
const imageSizes = await Promise.all(imageFiles.filter((name) => name.endsWith('.webp')).map(async (name) => (await stat(resolve(root, 'assets/images', name))).size));
console.log(`Verified ${gallery.length} creations, local assets, anchors, image dimensions, category totals, external links and motion fallback.`);
console.log(`Transfer budgets: HTML ${gzipSync(html).length} B gzip; CSS ${gzipSync(css).length} B gzip; JavaScript ${gzipSync(js).length} B gzip.`);
console.log(`Responsive photo and logo files: ${(imageSizes.reduce((a, b) => a + b, 0) / 1024 / 1024).toFixed(2)} MiB in total; images below the fold are lazy-loaded.`);
