import { createServer, defineConfig } from 'vite';
import { createReadStream, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { articleHead, findArticle, localHead } from './src/blog-seo.js';
import { findLocalPage } from './src/local-seo.js';
import { canonicalPath, normalizeSeoPath, seoHtml, seoPaths, siteOrigin } from './src/seo-routes.js';
import vercel from './vercel.json' with { type: 'json' };

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = value => value.replace(/[&<>"]/g, character => entities[character]);
const clinic = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  '@id': siteOrigin + '/#clinic',
  name: 'Curls & Curves Cosmetic Surgery Centre',
  url: siteOrigin + '/',
  telephone: '+91 94802 81652',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '#15, 8th Cross Road, MC Layout, Vijayanagar',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560040',
    addressCountry: 'IN',
  },
};

function describePage(markup, title) {
  const $ = load(markup);
  const heading = $('h1').first();
  const content = heading.closest('section, article, main');
  const text = content.find('p').toArray()
    .map(node => $(node).text().replace(/\s+/g, ' ').trim())
    .find(value => value.length > 55);
  if (!text) return 'Explore ' + title + ' at Curls & Curves Cosmetic Surgery Centre in Bengaluru.';
  if (text.length <= 160) return text;
  return text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

export default defineConfig({
  appType: 'mpa',
  server: {
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/data/**', '**/reference/**', '**/*.sqlite*', '**/*.zip'] },
  },
  plugins: [{
    name: 'local-static-routing',
    configureServer(server) {
      server.middlewares.use(localRoutes(false));
    },
    configurePreviewServer(server) {
      if (server.config.mode === 'gallery') server.middlewares.use(localGalleryFiles());
      server.middlewares.use(localRoutes(true));
    },
  }, {
    name: 'prerender-seo-pages',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_options, bundle) {
      const rewrites = new Map(vercel.rewrites.map(rule => [rule.source, rule.destination]));
      for (const path of seoPaths) {
        if (rewrites.get(path) !== '/' + seoHtml(path)) throw new Error('Vercel rewrite missing for ' + path + '. Run npm run sync:routes.');
      }
      const template = bundle['index.html'].source;
      const fallbackCss = Object.keys(bundle).find(file => /^assets\/style-.*\.css$/.test(file));
      const vite = await createServer({ configFile: false, mode: 'production', server: { middlewareMode: true, ws: false, hmr: false, watch: null } });
      try {
        const { referencePage, renderPage } = await vite.ssrLoadModule('/src/seo-render.jsx');
        for (const path of seoPaths) {
          const canonical = canonicalPath(path);
          const article = findArticle(canonical);
          const local = findLocalPage(canonical);
          const reference = referencePage(path);
          const initialPage = reference ? JSON.parse(readFileSync('public' + reference, 'utf8')) : null;
          const markup = renderPage(path, initialPage).replaceAll('href="/src/style.css"', 'href="/' + fallbackCss + '"');
          const heading = load(markup)('h1').first().text().trim();
          if (!heading) throw new Error('Missing prerendered heading for ' + path);
          const pageName = path.startsWith('/guide/') ? heading + ' Patient Guide' : heading;
          const title = article?.seoTitle || local?.seoTitle || pageName + ' | Curls & Curves';
          const description = article?.description || local?.description || describePage(markup, heading);
          const tags = article ? articleHead(article) : local ? localHead(local) : [
            ['meta', { name: 'description', content: description }],
            ['link', { rel: 'canonical', href: siteOrigin + canonical }],
          ];
          if (!article) tags.push(
            ['meta', { property: 'og:type', content: 'website' }],
            ['meta', { property: 'og:title', content: title }],
            ['meta', { property: 'og:description', content: description }],
            ['meta', { property: 'og:url', content: siteOrigin + canonical }],
          );
          tags.push(['meta', { name: 'seo-route', content: path }]);
          let head = tags.map(([tag, attributes]) => {
            const html = Object.entries(attributes).map(([key, value]) => key + '="' + escapeHtml(value) + '"').join(' ');
            return '<' + tag + ' data-page-head ' + html + '>';
          }).join('\n');
          if (canonical === '/' || canonical === '/contact') {
            head += '\n<script data-page-head type="application/ld+json">' + JSON.stringify(clinic).replace(/</g, '\\u003c') + '</script>';
          }
          const html = template
            .replace(/<meta name="description"[^>]*>/, () => head)
            .replace(/<title>[^<]*<\/title>/, () => '<title>' + escapeHtml(title) + '</title>')
            .replace('<body>', () => '<body class="' + escapeHtml(initialPage?.bodyClass || '') + '">')
            .replace('<div id="root"></div>', () => '<div id="root">' + markup + '</div>');
          this.emitFile({ type: 'asset', fileName: seoHtml(path), source: html });
        }
        const canonicalUrls = [...new Set(seoPaths.map(canonicalPath))];
        const locations = canonicalUrls.map(path => '<url><loc>' + escapeHtml(siteOrigin + path) + '</loc></url>').join('\n');
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + locations + '\n</urlset>\n' });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: 'User-agent: *\nAllow: /\nSitemap: ' + siteOrigin + '/sitemap.xml\n' });
      } finally {
        await vite.close();
      }
    },
  }],
});

function localRoutes(built) {
  const redirects = new Map(vercel.redirects.map(rule => [rule.source, rule.destination]));
  const pages = new Set(seoPaths);
  return (request, response, next) => {
    if (!['GET', 'HEAD'].includes(request.method)) return next();
    const url = new URL(request.url, 'http://localhost');
    const path = normalizeSeoPath(url.pathname);
    const destination = redirects.get(path);
    if (destination) {
      response.writeHead(308, { Location: destination + url.search });
      return response.end();
    }
    if (pages.has(path)) request.url = (built ? '/' + seoHtml(path) : '/index.html') + url.search;
    return next();
  };
}

function localGalleryFiles() {
  const folder = resolve('data/case-gallery');
  const manifest = readFileSync(resolve(folder, 'manifest.json'));
  const filenames = new Set(JSON.parse(manifest).flatMap(item => item.photos.map(photo => photo.file))
    .filter(file => /^[a-f0-9]{24}\.webp$/.test(file)));

  return (request, response, next) => {
    if (!request.url.startsWith('/local-case-gallery/')) return next();
    const filename = request.url.slice('/local-case-gallery/'.length);
    if (!['GET', 'HEAD'].includes(request.method) ||
        !['127.0.0.1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress) ||
        !/^127\.0\.0\.1(?::\d+)?$/.test(request.headers.host || '') ||
        request.headers.forwarded || request.headers['x-forwarded-for'] ||
        ['cross-site', 'same-site'].includes(request.headers['sec-fetch-site']) ||
        (filename !== 'manifest.json' && !filenames.has(filename))) {
      response.writeHead(404);
      return response.end();
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    if (filename === 'manifest.json') {
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      return response.end(request.method === 'HEAD' ? undefined : manifest);
    }
    const image = createReadStream(resolve(folder, filename));
    image.on('error', () => {
      if (!response.headersSent) response.writeHead(404);
      response.end();
    });
    image.on('open', () => {
      response.setHeader('Content-Type', 'image/webp');
      if (request.method === 'HEAD') {
        image.destroy();
        response.end();
      } else image.pipe(response);
    });
  };
}
