import express from 'express';
import { blogPath, findArticle, findPreviousArticle } from '../src/blog-seo.js';
import { findLocalPage, localHtml } from '../src/local-seo.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { registerCaseGallery } from './case-gallery.js';

const app = express();
const host = process.env.HOST || '127.0.0.1';
const development = process.argv.includes('--dev');
const catalog = JSON.parse(readFileSync(new URL('../src/catalog.json', import.meta.url), 'utf8'));
const referenceRoutes = JSON.parse(readFileSync(new URL('../src/reference-routes.json', import.meta.url), 'utf8'));
app.disable('x-powered-by');
registerCaseGallery(app, host);
app.use('/api', (_request, response) => response.sendStatus(404));

app.get('/blog/:slug', (request, response, next) => {
  const previous = findPreviousArticle(request.path.replace(/\/$/, ''));
  if (!previous) return next();
  const query = request.url.slice(request.path.length);
  return response.redirect(308, blogPath(previous) + query);
});

if (development) {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true, fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/reference/**', '**/data/**', '**/server/**', '**/*.sqlite*', '**/*.zip'] } } });
  app.use(vite.middlewares);
} else {
  app.use(express.static(resolve('dist'), { index: false }));
  app.get('/{*path}', (request, response) => {
    if (!request.accepts('html') || /^\/(?:images|media|reference-site|blog-pages|local-pages)\//.test(request.path)) return response.sendStatus(404);
    const path = request.path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const article = findArticle(path);
    if (article) return response.sendFile(resolve('dist/blog-pages', article.slug + '.html'));
    const localPage = findLocalPage(path);
    if (localPage) return response.sendFile(resolve('dist', localHtml(localPage)));
    const found = Boolean(referenceRoutes[request.path] || referenceRoutes[path] || referenceRoutes[path + '/']) || ['/', '/index', '/procedures', '/services.php', '/guides', '/about', '/clinic', '/contact', '/before-after', '/blog'].includes(path)
      || catalog.procedures.some(item => path === '/procedure/' + item.slug)
      || catalog.guides.some(item => path === '/guide/' + item.slug);
    response.status(found ? 200 : 404).sendFile(resolve('dist/index.html'));
  });
}
const port = Number(process.env.PORT || 4173);
app.listen(port, host, () => console.log(`Curls & Curves http://${host}:${port}`));
