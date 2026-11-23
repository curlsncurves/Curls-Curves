import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { blogPath, findArticle, findPreviousArticle } from '../src/blog-seo.js';
import { findLocalPage, localHtml } from '../src/local-seo.js';
import { submitConsultation } from './consultations.js';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { registerCaseGallery } from './case-gallery.js';

const app = express();
const host = process.env.HOST || '127.0.0.1';
const development = process.argv.includes('--dev');
const directory = resolve(process.env.DATA_DIR || 'data');
const catalog = JSON.parse(readFileSync(new URL('../src/catalog.json', import.meta.url), 'utf8'));
const referenceRoutes = JSON.parse(readFileSync(new URL('../src/reference-routes.json', import.meta.url), 'utf8'));
mkdirSync(directory, { recursive: true });
const database = new DatabaseSync(resolve(directory, 'consultations.sqlite'));
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS consultations (
    reference TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL,
    topic TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL);
`);
if (!database.prepare('PRAGMA table_info(consultations)').all().some(column => column.name === 'email')) {
  database.exec("ALTER TABLE consultations ADD COLUMN email TEXT NOT NULL DEFAULT ''");
}
const save = database.prepare('INSERT INTO consultations (reference, name, phone, topic, created_at, email) VALUES (?, ?, ?, ?, ?, ?)');
const count = database.prepare(`
  INSERT INTO request_limits VALUES (?, 1, ?) ON CONFLICT(key)
  DO UPDATE SET attempts = attempts + 1 RETURNING attempts
`);
const prune = database.prepare('DELETE FROM request_limits WHERE expires <= ?');
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '4kb' }));
app.use('/api', (_request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});
registerCaseGallery(app, host);
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
const saveLocal = ({ reference, name, phone, topic, email, now, expires, key }) => {
  database.exec('BEGIN IMMEDIATE');
  try {
    prune.run(now);
    const accepted = count.get(key, expires).attempts <= 5;
    if (accepted) save.run(reference, name, phone, topic, new Date(now).toISOString(), email);
    database.exec('COMMIT');
    return accepted;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
};
app.post('/api/consultations', async (request, response) => {
  if (request.get('Sec-Fetch-Site') === 'cross-site') {
    return response.status(403).json({ message: 'Submit the form from the clinic website.' });
  }
  if (!request.is('application/json')) return response.sendStatus(415);
  const result = await submitConsultation(request.body, saveLocal);
  if (result.headers) response.set(result.headers);
  return response.status(result.status).json(result.body);
});
app.use('/api', (_request, response) => response.status(404).json({ message: 'Endpoint unavailable.' }));
app.use('/api', (error, _request, response, _next) => {
  const status = [400, 413].includes(error.status) ? error.status : 500;
  response.status(status).json({ message: status === 500 ? 'Unable to save your request. Please try again.' : 'Invalid request.' });
});

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
