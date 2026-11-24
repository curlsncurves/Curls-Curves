import articles from './blogs.json' with { type: 'json' };
import { findLocalPage } from './local-seo.js';
import { canonicalPath, normalizeSeoPath, seoPaths, siteOrigin as siteUrl } from './seo-routes.js';

const defaultDescription = 'Explore cosmetic surgery procedures and request a consultation with Curls & Curves in Vijayanagar, Bengaluru.';

export const blogPath = article => '/blog/' + article.slug;
export const findArticle = path => articles.find(article => blogPath(article) === path);
export const findPreviousArticle = path => articles.find(article => '/blog/' + article.previousSlug === path);

export function articleHead(article) {
  const url = siteUrl + blogPath(article);
  const image = siteUrl + article.image;
  return [
    ['meta', { name: 'description', content: article.description }],
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { property: 'og:title', content: article.seoTitle }],
    ['meta', { property: 'og:description', content: article.description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:alt', content: article.alt }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ];
}

export function localHead(page) {
  return [
    ['meta', { name: 'description', content: page.description }],
    ['link', { rel: 'canonical', href: siteUrl + page.path }],
  ];
}

export function updatePageHead(path) {
  const normalized = normalizeSeoPath(path);
  if (document.head.querySelector('meta[name="seo-route"]')?.content === normalized) return;
  const canonical = canonicalPath(normalized);
  const article = findArticle(canonical);
  const localPage = findLocalPage(canonical);
  const previous = document.head.querySelectorAll('[data-page-head], meta[name="description"]');
  const entries = article ? articleHead(article)
    : localPage ? localHead(localPage)
      : [['meta', { name: 'description', content: defaultDescription }]];
  if (!article && !localPage && seoPaths.includes(normalized)) entries.push(['link', { rel: 'canonical', href: siteUrl + canonical }]);
  for (const [tag, attributes] of entries) {
    const node = document.createElement(tag);
    node.setAttribute('data-page-head', '');
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    document.head.append(node);
  }
  previous.forEach(node => node.remove());
}
