import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';

const routeFile = 'src/reference-routes.json';
const routes = JSON.parse(fs.readFileSync(routeFile));
const { procedures, guides } = JSON.parse(fs.readFileSync('src/catalog.json'));
const report = JSON.parse(fs.readFileSync('reference/capture-report.json'));
const home = JSON.parse(fs.readFileSync('public' + routes['/']));
const $home = load(home.html);
const header = $home('.site-header, .mobile-nav-overlay, .mobile-nav').filter((_, element) =>
  !$home(element).parents('.site-header, .mobile-nav-overlay, .mobile-nav').length).toArray().map(element => $home.html(element)).join('');
const footer = $home('.site-footer').first().toString();
const known = {
  '/breast-augmentation.php': '/breast-augmentation-in-bangalore',
  '/tummy-tuck.php': '/tummy-tuck-in-bangalore',
  '/facelift.php': '/full-face-lift-in-bangalore',
  '/liposuction.php': '/liposuction-in-bangalore',
  '/septoplasty.php': '/septoplasty-surgery-in-bangalore',
  '/services.php': '/procedures',
};
const renamed = {
  'asian-blepharoplasty': 'asian-blepharoplasty-double-eyelid-surgery',
  'dimple-creation-surgery': 'dimple-creation',
  'cheek-liposuction-in': 'cheek-liposuction',
  'breast-fat-transfer': 'breast-augmentation-by-fat-grafting',
  'buttock-fat-transfer': 'buttock-fat-grafting',
  'body-fat-transfer': 'fat-grafting-surgery',
};

function writePage(path, html, title) {
  const name = createHash('sha256').update(path).digest('hex').slice(0, 20) + '.json';
  routes[path] = '/reference-site/' + name;
  fs.writeFileSync('public' + routes[path], JSON.stringify({ ...home, html: header + html + footer, title }));
}
for (const path of report.unavailable) {
  const canonical = known[path] || path.replace(/^\/procedure\//, '/').replace(/(?<!-in)-bangalore$/, '-in-bangalore');
  if (routes[canonical]) {
    routes[path] = routes[canonical];
    continue;
  }
  if (canonical === '/procedures') continue;
  const slug = canonical.split('/').at(-1).replace(/-in-bangalore$/, '');
  const item = [...procedures, ...guides].find(entry => entry.slug === (renamed[slug] || slug));
  const title = item?.title || slug.replaceAll('-', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  writePage(path, `<main><section class="welcome-section"><div class="container"><h1 class="section-title">${esc(title)}</h1><p>Discuss treatment options, suitability and recovery with the clinic.</p><p style="margin-top: 20px"><a class="btn-primary" href="/contact${procedures.includes(item) ? '?procedure=' + item.slug : ''}">Request a consultation</a></p></div></section></main>`, `${title} | Curls & Curves`);
}
fs.writeFileSync(routeFile, JSON.stringify(routes, null, 2) + '\n');
console.log('Reference route table:', Object.keys(routes).length);
