import { load } from 'cheerio';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

const origin = 'https://curlsncurves.com';
const assets = new Map();
const pages = {};
const stylesheets = new Map();
const unavailable = new Set();
const queue = new Set(['/']);
const output = 'public/reference-site';
await mkdir(output, { recursive: true });

async function fetchSource(url) {
  const { stdout } = await run('curl.exe', ['-LsS', '--max-time', '12', '-w', '\n%{http_code} %{content_type} %{url_effective}', url],
    { encoding: 'buffer', maxBuffer: 24 * 1024 * 1024, windowsHide: true });
  const delimiter = stdout.lastIndexOf(10);
  const [status, ...metadata] = stdout.subarray(delimiter + 1).toString().split(' ');
  const resultUrl = metadata.pop();
  const content = stdout.subarray(0, delimiter);
  return {
    ok: Number(status) >= 200 && Number(status) < 300 && new URL(resultUrl).origin === origin,
    url: resultUrl,
    headers: new Headers({ 'content-type': metadata.join(' ') }),
    text: () => content.toString('utf8'),
    arrayBuffer: () => content
  };
}
function resolve(value, base) {
  try { return new URL(value.trim(), base); } catch { return null; }
}
function asset(url) {
  if (!assets.has(url.href)) {
    const name = createHash('sha256').update(url.href).digest('hex').slice(0, 20) + extname(url.pathname);
    assets.set(url.href, { url, name });
  }
  return '/reference-site/' + assets.get(url.href).name;
}
function css(source, base) {
  return source.replace(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/g, (original, quote, value) => {
    const url = resolve(value, base);
    return url?.origin === origin ? 'url("' + asset(url) + '")' : original;
  });
}
function isPage(url) {
  return url?.origin === origin && !/\.(?!html?$|php$)[a-z\d]+$/i.test(url.pathname) && !/^\/(?:images|assets|admin|uploads)\//i.test(url.pathname);
}
async function loadPage(path) {
  let response;
  try { response = await fetchSource(origin + path); } catch { unavailable.add(path); return; }
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) { unavailable.add(path); return; }
  const $ = load(await response.text());
  const base = resolve($('base[href]').first().attr('href') || response.url, response.url)?.href || response.url;
  const title = $('title').first().text().trim();
  if (!title || $('body').text().includes('SQLSTATE[')) { unavailable.add(path); return; }
  // Use public page content only. Rebuild interactions without running downloaded scripts.
  $('script, noscript, base, object, embed, iframe:not([src^="https://www.google.com/maps/embed"])').remove();
  const styles = [];
  const fonts = [];
  await Promise.all($('head link[rel="stylesheet"]').toArray().map(async (element, index) => {
    const url = resolve($(element).attr('href') || '', base);
    if (!url) return;
    if (url.hostname === 'fonts.googleapis.com') { fonts[index] = url.href; return; }
    if (url.origin !== origin) return;
    try {
      const key = url.origin + url.pathname;
      if (!stylesheets.has(key)) stylesheets.set(key, fetchSource(url.href).then(stylesheet => {
        if (!stylesheet.ok) throw new Error('Stylesheet unavailable');
        return css(stylesheet.text(), url.href);
      }));
      styles[index] = await stylesheets.get(key);
    } catch { console.warn('Stylesheet unavailable:', url.pathname); }
  }));
  $('style').each((_, element) => {
    styles.push(css($(element).text(), base));
    $(element).remove();
  });
  $('body > div').filter((_, element) => /^Note: Our website is currently undergoing scheduled upgrades\./.test($(element).text().trim())).remove();
  $('body *').each((_, element) => {
    for (const name of Object.keys(element.attribs || {})) {
      if (/^on/i.test(name)) {
        if (name === 'onclick') $(element).attr('data-original-action', element.attribs[name]);
        $(element).removeAttr(name);
      }
      if (['src', 'poster', 'href', 'action'].includes(name)) {
        const value = $(element).attr(name);
        if (/^\s*(javascript|vbscript):/i.test(value)) { $(element).removeAttr(name); continue; }
        if (value.startsWith('#') || /^(data|mailto|tel):/i.test(value)) continue;
        const url = resolve(value, base);
        if (!url || !['https:', 'http:'].includes(url.protocol)) continue;
        if (name === 'href' && isPage(url)) {
          queue.add(url.pathname);
          $(element).attr(name, url.pathname + url.search + url.hash);
        } else if (['src', 'poster'].includes(name) && url.origin === origin) {
          $(element).attr(name, asset(url));
        } else $(element).attr(name, url.href);
      }
      if (name === 'srcset') {
        $(element).attr(name, element.attribs[name].split(',').map(candidate => {
          const [value, size] = candidate.trim().split(/\s+/);
          const url = resolve(value, base);
          return [url?.origin === origin ? asset(url) : url?.href, size].filter(Boolean).join(' ');
        }).join(', '));
      }
      if (name === 'style') $(element).attr(name, css(element.attribs[name], base));
    }
  });
  const styleText = [...new Set(styles.filter(Boolean))].join('\n');
  const styleName = createHash('sha256').update(styleText).digest('hex').slice(0, 20) + '.css';
  await writeFile(output + '/' + styleName, styleText);
  const pageName = createHash('sha256').update(path).digest('hex').slice(0, 20) + '.json';
  await writeFile(output + '/' + pageName, JSON.stringify({
    title, html: $('body').html()?.replace(/<!--[\s\S]*?-->/g, '') ?? '',
    style: '/reference-site/' + styleName, fonts: fonts.filter(Boolean),
    bodyClass: $('body').attr('class') || ''
  }));
  pages[path] = '/reference-site/' + pageName;
}
const visited = new Set();
while (visited.size < 230) {
  const batch = [...queue].filter(path => !visited.has(path)).slice(0, 10);
  if (!batch.length) break;
  batch.forEach(path => visited.add(path));
  await Promise.all(batch.map(loadPage));
  console.log('Pages checked:', visited.size, 'captured:', Object.keys(pages).length);
}
const missingAssets = [];
const files = [...assets.values()];
let cursor = 0;
await Promise.all(Array.from({ length: 14 }, async () => {
  while (cursor < files.length) {
    const { url, name } = files[cursor++];
    try {
      if (await stat(output + '/' + name).catch(() => null)) continue;
      const response = await fetchSource(url.href);
      if (!response.ok || /text\/html/i.test(response.headers.get('content-type') || '')) throw new Error('Unavailable');
      await writeFile(output + '/' + name, Buffer.from(await response.arrayBuffer()));
    } catch { missingAssets.push(url.pathname); }
  }
}));
await writeFile('src/reference-routes.json', JSON.stringify(pages, null, 2) + '\n');
await writeFile('reference/capture-report.json', JSON.stringify({ unavailable: [...unavailable], missingAssets }, null, 2));
console.log('Captured:', Object.keys(pages).length, 'pages and', files.length - missingAssets.length, 'assets.', unavailable.size, 'unavailable routes.', missingAssets.length, 'unavailable assets.');
