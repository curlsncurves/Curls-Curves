import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import articles from './blogs.json';
import catalog from './catalog.json';
import { blogPath, findArticle } from './blog-seo.js';
import ConsultationForm from './consultation-form.jsx';
import ProcedureEducation from './procedure-education.jsx';
import { educationFor } from './procedure-education.js';
import { catalogProcedure, procedurePath } from './procedure-routes.js';
import './clinic-pages.css';

export function brandedPage(pathname) {
  const path = pathname.replace(/\/$/, '');
  if (['/procedures', '/procedures.html', '/services.php'].includes(path)) return { title: 'Cosmetic procedures', kind: 'procedures' };
  if (['/contact', '/contact.html'].includes(path)) return { title: 'Request a consultation', kind: 'contact' };
  if (['/blog', '/blog.php'].includes(path)) return { title: 'Blogs', kind: 'blog' };
  const procedure = catalogProcedure(path);
  if (procedure && procedurePath(procedure.slug) === path.replace(/\.html$/, '')) return { title: procedure.title, kind: 'procedure', procedure };
  const article = findArticle(path);
  return article ? { title: article.title, kind: 'article', article } : null;
}

const categories = [...new Set(catalog.procedures.map(item => item.category))].sort();

function ProcedureDirectory({ title }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const query = search.trim().toLowerCase();
  const results = catalog.procedures.filter(item => (!category || item.category === category) && item.title.toLowerCase().includes(query));

  return <main id="main" className="clinic-new-page">
    <section className="clinic-page-lead"><div className="container">
      <h1>{title}</h1><p>Explore the procedures available at Curls &amp; Curves.</p>
    </div></section>
    <section className="container clinic-directory" aria-label="Procedure directory">
      <div className="clinic-consultation-form clinic-directory-filters">
        <label>Search procedures<input type="search" value={search} placeholder="Search by procedure name"
          onChange={event => setSearch(event.target.value)} /></label>
        <label>Category<select value={category} onChange={event => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map(value => <option key={value} value={value}>{value}</option>)}
        </select></label>
      </div>
      <p className="clinic-directory-count" role="status">{results.length} {results.length === 1 ? 'procedure' : 'procedures'}</p>
      <div className="clinic-directory-grid">
        {results.map(item => <Link className="clinic-page-card" key={item.slug} to={procedurePath(item.slug)}>
          <p className="clinic-page-category">{item.category}</p><h2>{item.title}</h2>
        </Link>)}
      </div>
      {!results.length && <button type="button" className="clinic-page-action" onClick={() => { setSearch(''); setCategory(''); }}>Clear filters</button>}
    </section>
  </main>;
}

function ProcedureDetail({ item }) {
  const education = educationFor(item.slug);
  return <main id="main" className="clinic-new-page">
    {education ? <ProcedureEducation title={item.title} entry={education} slug={item.slug} /> : <>
      <section className="clinic-page-lead"><div className="container">
        <p className="clinic-page-category">{item.category}</p>
        <h1>{item.title}</h1><p>Discuss suitability, potential risks and recovery with your surgeon.</p>
      </div></section>
      <section className="container clinic-contact-grid">
        <article><h2>What to discuss</h2>
          <ul className="clinic-procedure-questions">
            <li>What could this procedure address in my case?</li>
            <li>What approaches and alternatives are available?</li>
            <li>Which risks are most relevant to my circumstances?</li>
            <li>What will recovery and follow-up involve?</li>
          </ul>
          {catalog.guides.some(guide => guide.slug === item.slug) && <Link className="clinic-text-link" to={'/guide/' + item.slug}>Read the patient guide</Link>}
        </article>
        <aside className="clinic-page-card"><h2>Speak to the clinic</h2>
          <div className="clinic-procedure-actions">
            <Link className="clinic-page-action" to={'/contact?procedure=' + item.slug}>Request a consultation</Link>
            <a className="clinic-text-link" href="tel:+919480281652">+91 94802 81652</a>
          </div>
        </aside>
      </section>
    </>}
    <div className="container clinic-procedure-back"><Link to="/procedures">View all procedures</Link></div>
  </main>;
}

export default function ClinicPage({ page }) {
  const { search } = useLocation();
  const topic = new URLSearchParams(search).get('procedure');
  if (page.kind === 'procedures') return <ProcedureDirectory title={page.title} />;
  if (page.kind === 'procedure') return <ProcedureDetail item={page.procedure} />;
  if (page.kind === 'contact') return <main id="main" className="clinic-new-page">
    <section className="clinic-page-lead"><div className="container">
      <h1>{page.title}</h1><p>Request a callback or contact Curls &amp; Curves directly.</p>
    </div></section>
    <section className="container clinic-contact-grid">
      <div className="clinic-page-card"><h2>Callback request</h2><ConsultationForm key={topic} procedure={topic} /></div>
      <aside className="clinic-page-card"><h2>Visit Curls &amp; Curves</h2>
        <address>#15, 8th Cross Road, MC Layout, Vijayanagar, Bengaluru 560040</address>
        <ul className="clinic-contact-links">
          <li><a href="https://www.google.com/maps/search/?api=1&query=Curls+and+Curves+Vijayanagar+Bengaluru">Get directions</a></li>
          <li><a href="tel:+919480281652">+91 94802 81652</a></li>
          <li><a href="https://wa.me/919480281652">Message on WhatsApp</a></li>
          <li><a href="mailto:drgirishac74@gmail.com">drgirishac74@gmail.com</a></li>
        </ul>
      </aside>
    </section>
  </main>;

  if (page.article) {
    const { article } = page;
    return <main id="main" className="clinic-new-page">
      <article className="container clinic-article">
        <Link to="/blog.php">All articles</Link>
        <p className="clinic-page-category">{article.category}</p><h1>{article.title}</h1>
        <p className="clinic-article-status">Editorial draft for clinical review</p>
        <figure><img src={article.image} alt={article.alt} width="768" height="512" />
          <figcaption>AI-generated illustration</figcaption></figure>
        <p className="clinic-article-intro">{article.intro}</p>
        {article.sections.map(({ heading, paragraphs }) => <section key={heading}>
          <h2>{heading}</h2>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>)}
        <Link className="clinic-page-action" to="/contact">Request a consultation</Link>
      </article>
    </main>;
  }
  return <main id="main" className="clinic-new-page">
    <section className="clinic-page-lead"><div className="container"><h1>Blogs</h1><p>Patient education from Curls &amp; Curves.</p></div></section>
    <section className="container clinic-blog-grid" aria-label="Clinic articles">
      {articles.map(article => <article key={article.slug} className="clinic-blog-card">
        <Link to={blogPath(article)}>
          <span className="clinic-blog-image"><img src={article.image} alt={article.alt} width="768" height="512" loading="lazy" /></span>
          <div><p className="clinic-page-category">{article.category}</p><h2>{article.title}</h2>
          <span className="clinic-blog-read">Read article</span></div>
        </Link>
      </article>)}
    </section>
  </main>;
}
