import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const creations = JSON.parse(await readFile(new URL('scripts/gallery.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('assets/images/manifest.json', root), 'utf8'));
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const markup = creations.map((creation, index) => {
  const variants = manifest.photos[creation.slug]?.variants;
  if (!variants) throw new Error(`Missing image variants for ${creation.slug}`);
  const small = variants[0];
  const large = variants.at(-1);
  return `        <figure class="creation" data-category="${escape(creation.category)}" data-caption="${escape(creation.caption)}">
          <a class="photo-link" href="assets/images/${large.file}" aria-label="View ${escape(creation.title)} photograph">
            <img src="assets/images/${small.file}" srcset="${variants.map((variant) => `assets/images/${variant.file} ${variant.width}w`).join(', ')}" sizes="(max-width: 700px) calc((100vw - 64px) / 2), (min-width: 1600px) 423px, calc((89vw - 52px) / 3)" width="${small.width}" height="${small.height}" alt="${escape(creation.alt)}" loading="lazy" decoding="async">
            <span class="photo-action" aria-hidden="true"><svg class="icon"><use href="#arrow-up-right"/></svg></span>
          </a>
          <figcaption><div><h3>${escape(creation.title)}</h3><p class="creation-category">${escape(creation.label)}</p></div><span class="creation-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></figcaption>
        </figure>`;
}).join('\n');
const path = new URL('index.html', root);
const html = await readFile(path, 'utf8');
if (!html.includes('<!-- GALLERY_START -->') || !html.includes('<!-- GALLERY_END -->')) throw new Error('Gallery markers are missing');
await writeFile(path, html.replace(/<!-- GALLERY_START -->[\s\S]*?<!-- GALLERY_END -->/, `<!-- GALLERY_START -->\n${markup}\n        <!-- GALLERY_END -->`));
console.log(`Rendered ${creations.length} photographs into accessible static HTML.`);
