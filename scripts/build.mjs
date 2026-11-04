import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'styles.css', 'script.js', '404.html', '.nojekyll', 'assets']) {
  await cp(join(root, path), join(output, path), { recursive: true });
}
console.log('Static site prepared in dist/. No dependencies, bundler or runtime build needed.');
