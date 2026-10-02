import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'out');

if (fs.existsSync(outDir)) {
  // 1. Create .nojekyll so GitHub Pages does not ignore _next
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  console.log('✓ Created out/.nojekyll');

  // 2. Create 404.html from 404/index.html or _not-found
  const notFound404 = path.join(outDir, '404', 'index.html');
  const notFoundHtml = path.join(outDir, '_not-found.html');
  const notFoundIndex = path.join(outDir, '_not-found', 'index.html');
  const target404 = path.join(outDir, '404.html');

  if (fs.existsSync(notFound404)) {
    fs.copyFileSync(notFound404, target404);
    console.log('✓ Copied out/404/index.html -> out/404.html');
  } else if (fs.existsSync(notFoundHtml)) {
    fs.copyFileSync(notFoundHtml, target404);
    console.log('✓ Copied out/_not-found.html -> out/404.html');
  } else if (fs.existsSync(notFoundIndex)) {
    fs.copyFileSync(notFoundIndex, target404);
    console.log('✓ Copied out/_not-found/index.html -> out/404.html');
  }
}

