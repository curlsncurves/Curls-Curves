import { defineConfig } from 'vite';
import articles from './src/blogs.json' with { type: 'json' };
import { articleHead, localHead } from './src/blog-seo.js';
import { localHtml, localPages } from './src/local-seo.js';

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = value => value.replace(/[&<>"]/g, character => entities[character]);

export default defineConfig({
  plugins: [{
    name: 'page-seo-html',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const template = bundle['index.html'].source;
      const emitPage = (fileName, title, head) => {
        const tags = head.map(([tag, attributes]) => {
          const html = Object.entries(attributes).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ');
          return `<${tag} data-page-head ${html}>`;
        }).join('\n');
        const source = template
          .replace(/<meta name="description"[^>]*>/, () => tags)
          .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`);
        this.emitFile({ type: 'asset', fileName, source });
      };
      for (const article of articles) emitPage(`blog-pages/${article.slug}.html`, article.seoTitle, articleHead(article));
      for (const page of localPages) emitPage(localHtml(page), page.seoTitle, localHead(page));
    }
  }]
});
