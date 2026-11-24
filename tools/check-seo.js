import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';
import { canonicalPath, seoHtml, seoPaths, siteOrigin } from '../src/seo-routes.js';
import vercel from '../vercel.json' with { type: 'json' };

const read = file => readFileSync(new URL('../dist/' + file, import.meta.url), 'utf8');
const sitemap = load(read('sitemap.xml'), { xml: true });
const locations = sitemap('loc').map((_, node) => sitemap(node).text()).get();
const canonicals = [...new Set(seoPaths.map(canonicalPath))];
const publicPaths = new Set([...seoPaths, ...vercel.redirects.map(rule => rule.source)]);
const builtFile = path => existsSync(new URL('../dist' + path, import.meta.url));
assert.deepEqual(locations, canonicals.map(path => siteOrigin + path));
assert(read('robots.txt').includes('Sitemap: ' + siteOrigin + '/sitemap.xml'));
for (const path of ['/local-case-gallery', '/data', '/reference', '/api', '/.env']) {
  assert(!builtFile(path), 'Unexpected deployment output: ' + path);
}
for (const path of seoPaths) {
  const $ = load(read(seoHtml(path)));
  assert($('title').text().trim(), path);
  assert.equal($('meta[name="description"]').length, 1, path);
  assert($('meta[name="description"]').attr('content')?.trim(), path);
  assert.equal($('link[rel="canonical"]').length, 1, path);
  assert.equal($('link[rel="canonical"]').attr('href'), siteOrigin + canonicalPath(path), path);
  assert($('#root h1').first().text().trim(), path);
  assert($('#root a[href]').length, path);
  for (const element of $('script[src], link[rel="stylesheet"][href], img[src], source[src], a[href]')) {
    const url = element.attribs.src || element.attribs.href;
    if (!/^\/(?!\/)/.test(url)) continue;
    const destination = url.split(/[?#]/)[0];
    const route = destination.replace(/\/$/, '') || '/';
    const isPage = element.name === 'a' && publicPaths.has(route);
    assert(isPage || builtFile(destination), path + ' → ' + url);
  }
}
const home = load(read(seoHtml('/')));
assert.equal(JSON.parse(home('script[type="application/ld+json"]').first().text())['@type'], 'MedicalClinic');
console.log('Verified ' + seoPaths.length + ' prerendered pages and ' + locations.length + ' canonical sitemap URLs.');
