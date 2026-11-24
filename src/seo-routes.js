import routes from './reference-routes.json' with { type: 'json' };
import catalog from './catalog.json' with { type: 'json' };
import articles from './blogs.json' with { type: 'json' };
import { procedurePath } from './procedure-routes.js';

export const siteOrigin = 'https://curlsncurves.com';
const aliases = {
  '/index': '/',
  '/index.php': '/',
  '/services.php': '/procedures',
  '/procedures.html': '/procedures',
  '/contact.html': '/contact',
  '/blog': '/blog.php',
  '/before-after': '/before-after.php',
  '/about': '/about-doctor.php',
  '/procedure/body-fat-transfer-in-bangalore': '/body-fat-transfer-in-bangalore',
  '/procedure/breast-fat-transfer-in-bangalore': '/breast-fat-transfer-in-bangalore',
  '/procedure/buttock-fat-transfer-in-bangalore': '/buttock-fat-transfer-in-bangalore',
  '/procedure/hymenoplasty-surgery-bangalore': '/hymenoplasty-surgery-in-bangalore',
  '/procedure/lipoma-surgery-bangalore': '/lipoma-surgery-in-bangalore',
  '/procedure/vagina-tightening-surgery-bangalore': '/vagina-tightening-surgery-in-bangalore',
};
const core = ['/', '/procedures', '/guides', '/clinic', '/contact', '/blog.php', '/before-after.php', '/about-doctor.php'];
const catalogPaths = catalog.procedures.map(item => procedurePath(item.slug));
const referenceCanonicals = new Map();

for (const path of [...core, ...catalogPaths, ...Object.keys(routes)]) {
  if (routes[path] && !aliases[path] && !referenceCanonicals.has(routes[path])) {
    referenceCanonicals.set(routes[path], path);
  }
}
for (const item of catalog.procedures) {
  const alias = '/procedure/' + item.slug;
  const destination = procedurePath(item.slug);
  if (alias !== destination) aliases[alias] = destination;
  // Some captured pages are available both under the directory and at the root.
  const root = '/' + item.slug + '-in-bangalore';
  const nested = '/procedure' + root;
  if (destination === root && routes[nested]) aliases[nested] = root;
}

export function normalizeSeoPath(path) {
  return path.replace(/\/$/, '') || '/';
}

export function canonicalPath(path) {
  const normalized = normalizeSeoPath(path);
  return aliases[normalized] || referenceCanonicals.get(routes[normalized]) || normalized;
}

export const seoPaths = [...new Set([
  ...core, ...Object.keys(routes), ...Object.keys(aliases), ...catalogPaths,
  ...catalog.guides.map(item => '/guide/' + item.slug),
  ...articles.map(article => '/blog/' + article.slug),
].map(normalizeSeoPath))].sort();

export function seoHtml(path) {
  return 'seo-pages/' + (normalizeSeoPath(path).slice(1) || 'home') + '.html';
}
