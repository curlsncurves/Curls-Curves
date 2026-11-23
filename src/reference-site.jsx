import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import routes from './reference-routes.json';
import './reference-motion.css';
import './reference-responsive.css';
import { useSiteMotion } from './site-motion.js';
import { prepareReferencePage } from './reference-loading.js';
import missingImages from './missing-reference-images.json';
import ClinicPage, { brandedPage } from './clinic-pages.jsx';
import ConsultationForm from './consultation-form.jsx';
import { catalogProcedure, procedureForPublishedPath, procedurePath } from './procedure-routes.js';
import { findLocalPage, localPages } from './local-seo.js';
import CaseGallery, { caseProcedure } from './case-gallery.jsx';
import ProcedureEducation from './procedure-education.jsx';
import { educationFor, rhinoplastyFaq, rhinoplastySource } from './procedure-education.js';

const unavailableImages = new Set(missingImages);
const placeholderOverview = 'Discuss treatment options, suitability and recovery with the clinic.';
function nodeText(node) {
  return node.data || (node.children || []).map(nodeText).join('');
}

export function referencePage(path) {
  if (brandedPage(path)) return '/reference-site/clinic-page-shell.json';
  const item = catalogProcedure(path);
  if (item) return routes[procedurePath(item.slug)];
  return routes[path] || routes[path.replace(/\/$/, '')] || routes[path + '/'];
}

const sectionLinks = {
  'view-all': '/procedures', profile: '/about-doctor.php', 'all-results': '/before-after.php',
  about: '/about-doctor.php', 'before-after': '/before-after.php', guides: '/guides',
  procedures: '/#procedures', results: '/#results', testimonials: '/#testimonials',
  stories: '/#testimonials', contact: '/#contact', sitemap: '/procedures',
};

function moveSlide(container, selector, direction, display = false, absolute = false) {
  const slides = [...(container?.querySelectorAll(selector) || [])];
  if (!slides.length) return;
  const current = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
  const index = absolute ? direction : (current + direction + slides.length) % slides.length;
  slides.forEach((slide, position) => {
    slide.classList.toggle('active', position === index);
    if (display) slide.style.display = position === index ? 'block' : 'none';
  });
}

export default function ReferenceSite({ source, initialPage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const branded = brandedPage(location.pathname);
  const catalogItem = catalogProcedure(location.pathname);
  const contentPath = catalogItem ? procedurePath(catalogItem.slug) : location.pathname;
  const localPage = findLocalPage(contentPath.replace(/\/$/, '') || '/');
  const pageTitle = localPage?.seoTitle || branded?.article?.seoTitle || (branded ? branded.title + ' | Curls & Curves' : null);
  const mainGallery = caseProcedure(location.pathname) === '';
  const procedure = caseProcedure(location.pathname);
  const surface = useRef(null);
  const trigger = useRef(null);
  const [content, setContent] = useState(initialPage || null);
  const [failed, setFailed] = useState(false);

  useSiteMotion(surface, Boolean(content));
  useEffect(() => {
    if (initialPage) return;
    let live = true;
    prepareReferencePage(source).then(page => {
      if (live) setContent(page);
    }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [source, initialPage]);

  useEffect(() => {
    if (!content) return;
    document.title = pageTitle || content.title;
    document.body.className = content.bodyClass;
    return () => { document.body.className = ''; };
  }, [content, pageTitle]);

  useEffect(() => {
    if (!content) return;
    const id = location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [content, location.pathname, location.hash]);

  function close() {
    const root = surface.current;
    const modal = root.querySelector('#bookingModal');
    if (modal?.style.display === 'flex') {
      modal.style.display = 'none';
      trigger.current?.focus();
    }
    root.querySelector('.mobile-nav')?.classList.remove('open');
    root.querySelector('.mobile-nav-overlay')?.classList.remove('open');
    root.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
  }

  function warmRoute(event) {
    const target = event.target.closest('a[data-route]');
    const href = target?.dataset.route;
    if (!href) return;
    const requested = referencePage(new URL(href, window.location.href).pathname);
    if (requested && requested !== source) prepareReferencePage(requested).catch(() => {});
  }

  function click(event) {
    const root = surface.current;
    const target = event.target.closest('a, button, [data-original-action], .mobile-nav-overlay');
    if (!target) return;
    if (target.matches('.menu-toggle')) {
      const open = root.querySelector('.mobile-nav')?.classList.toggle('open');
      root.querySelector('.mobile-nav-overlay')?.classList.toggle('open', open);
      target.setAttribute('aria-expanded', String(open));
      if (open) root.querySelector('.close-menu')?.focus();
      return;
    }
    if (target.matches('.close-menu, .mobile-nav-overlay')) {
      close();
      root.querySelector('.menu-toggle')?.focus();
      return;
    }
    if (target.matches('.mobile-dropbtn, .mobile-sub-dropbtn')) {
      event.preventDefault();
      const open = target.parentElement.classList.toggle('active');
      target.setAttribute('aria-expanded', String(open));
      return;
    }
    if (target.matches('.faq-question')) {
      const open = target.parentElement.classList.toggle('active');
      target.setAttribute('aria-expanded', String(open));
      const icon = target.querySelector('.faq-icon');
      if (icon) icon.textContent = open ? '−' : '+';
      return;
    }
    const action = target.dataset.originalAction || '';
    const tab = action.match(/^showTransTab\('([a-z]+)', this\)$/);
    const arrows = action.match(/^move(Trans|Ba)Slide\('([a-z]+)', (-?1)\)$/);
    const review = action.match(/^changeReview\((-?1)\)$/);
    const service = action.match(/^(move|goTo)ServiceSlide\((-?\d+)\)$/);
    if (tab) {
      root.querySelectorAll('.trans-content').forEach(panel => { panel.style.display = panel.id === tab[1] ? 'block' : 'none'; });
      root.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.toggle('active', button === target);
        button.setAttribute('aria-pressed', String(button === target));
      });
    } else if (arrows) {
      const gallery = arrows[1] === 'Ba';
      moveSlide(root.querySelector('#' + arrows[2] + (gallery ? '-slider' : '')), gallery ? '.t-slide-wrapper' : '.t-slide', Number(arrows[3]), gallery);
    } else if (review) {
      moveSlide(root, '.review-slide', Number(review[1]));
    } else if (service) {
      moveSlide(target.closest('.service-transformations-section') || root, '.service-slide, .t-slide-wrapper, .t-slide', Number(service[2]), true, service[1] === 'goTo');
    } else if (action === "document.getElementById('bookingModal').style.display='flex'") {
      const modal = root.querySelector('#bookingModal');
      if (modal) {
        trigger.current = target;
        modal.style.display = 'flex';
        modal.querySelector('input[name=name]')?.focus();
      }
    } else if (action === "document.getElementById('bookingModal').style.display='none'") {
      close();
    }
    if (target.matches('.mobile-nav a')) close();
    if (target.getAttribute('href') === '#' && !target.matches('.mobile-dropbtn, .mobile-sub-dropbtn')) event.preventDefault();
    if (target.dataset.route && !event.defaultPrevented && event.button === 0 &&
        !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigate(target.dataset.route);
    }
  }

  if (failed) return <p>Could not load this page. <a href="/">Return home</a></p>;
  if (!content) return null;
  const education = content.html.includes(placeholderOverview) ? educationFor(contentPath) : null;
  const fillNoseFaq = contentPath === '/service-rhinoplasty.php';
  let faqIndex = 0;
  return <>
    <link rel="stylesheet" href={content.style} />
    {content.fonts.map(font => <link rel="stylesheet" key={font} href={font} />)}
    <div className="reference-surface" style={{ display: 'contents' }} ref={surface} onClick={click} onFocus={warmRoute} onPointerDown={warmRoute}
      onKeyDown={event => {
        if (event.key === 'Escape') close();
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.close-modal')) {
          event.preventDefault();
          close();
        }
      }}>
      {parse(content.html, { replace(node, index) {
        if (!node.attribs) return;
        if (node.name === 'img' && unavailableImages.has(node.attribs.src)) {
          const alt = node.attribs.alt;
          const replacement = fillNoseFaq && alt === 'Revision Rhinoplasty' ? '/reference-site/e49fc7fc530d13c5b48b.webp'
            : /^Post Bariatric Surgery Body Contouring in Bangalore$/i.test(alt || '') ? '/reference-site/d7dea69c3ce18e76c97c.webp' : null;
          if (replacement) {
            node.attribs.src = replacement;
            delete node.attribs.srcset;
            node.attribs.alt = 'Illustrative treatment photograph';
            return;
          }
          return <span key={index} className={((node.attribs.class || '') + ' reference-image-missing').trim()}
            role="img" aria-label={alt ? alt + ' unavailable' : 'Image unavailable'}>Image unavailable</span>;
        }
        if (node.name === 'img') {
          const prominent = isProminentImage(node);
          node.attribs.decoding ??= 'async';
          if (!prominent) node.attribs.loading ??= 'lazy';
        }
        if (node.attribs.class?.split(' ').includes('menu-toggle')) {
          node.attribs['aria-label'] ??= 'Open navigation';
          node.attribs['aria-expanded'] ??= 'false';
        }
        if (node.name === 'a') {
          let href = node.attribs.href;
          const fragment = href?.startsWith('#') ? href.slice(1) : '';
          if (fragment && sectionLinks[fragment] && !content.html.includes('id="' + fragment + '"')) {
            href = node.attribs.href = sectionLinks[fragment];
          }
          if (href === '/services.php') href = node.attribs.href = '/procedures';
          if (!href?.startsWith('/') || href.startsWith('//') || node.attribs.target === '_blank' || node.attribs.download != null) return;
          node.attribs['data-route'] = href;
        }
        if (node.attribs.class?.split(' ').includes('close-modal')) {
          node.attribs.role = 'button';
          node.attribs.tabindex = '0';
          node.attribs['aria-label'] = 'Close consultation form';
        }
        if (node.attribs.id === 'bookingModal') {
          node.attribs.role = 'dialog';
          node.attribs['aria-label'] = 'Book your consultation';
        }
        if (node.name === 'form' && node.attribs.action?.endsWith('/process_booking.php')) {
          return <ConsultationForm key={index} procedure={(catalogItem || procedureForPublishedPath(contentPath))?.slug} />;
        }
      }, transform(element, node, index) {
        if (localPage?.path === '/' && node.name === 'footer' && node.attribs?.class?.split(' ').includes('site-footer')) {
          return <React.Fragment key={index}>
            <section className="container clinic-local-links" aria-labelledby="clinic-local-title">
              <h2 id="clinic-local-title">Plastic &amp; Cosmetic Surgery in Bangalore</h2>
              <ul>{localPages.filter(page => page.path !== '/').map(page =>
                <li key={page.path}><a href={page.path} data-route={page.path}>{page.topics.length === 1 ? page.topics[0] : 'Plastic & Cosmetic Surgeon in Bangalore'}</a></li>
              )}</ul>
            </section>
            {element}
          </React.Fragment>;
        }
        if (branded && node.name === 'footer' && node.attribs?.class?.split(' ').includes('site-footer')) {
          return <React.Fragment key={index}><ClinicPage page={branded} />{element}</React.Fragment>;
        }
        if (education && node.name === 'main' && nodeText(node).includes(placeholderOverview)) {
          return <main key={index}><ProcedureEducation title={content.title.split(' | ')[0]} entry={education} />
            {procedure && <CaseGallery procedure={procedure} />}
          </main>;
        }
        if (fillNoseFaq && node.attribs?.class?.split(' ').includes('faq-answer') &&
            nodeText(node).includes('Answer will be updated shortly.')) {
          const answer = rhinoplastyFaq[faqIndex++];
          if (answer) return React.cloneElement(element, undefined, <p>{answer}</p>);
        }
        if (node.name !== 'section' || !node.attribs) return element;
        if (fillNoseFaq && node.attribs.id === 'faqs') {
          return React.cloneElement(element, undefined, element.props.children,
            <p key="faq-source" className="education-faq-source"><a href={rhinoplastySource[1]}>{rhinoplastySource[0]}</a></p>);
        }
        const classes = (node.attribs.class || '').split(' ');
        if (mainGallery && classes.includes('ba-all-results')) {
          return <React.Fragment key={index}><CaseGallery />{element}</React.Fragment>;
        }
        if (procedure && node.attribs.id === 'results' && classes.includes('service-transformations-section')) {
          return React.cloneElement(element, undefined, element.props.children, <CaseGallery key="case-gallery" procedure={procedure} />);
        }
        if (procedure && !content.html.includes('id="results"') && classes.includes('testimonials-section')) {
          return <React.Fragment key={index}><CaseGallery procedure={procedure} />{element}</React.Fragment>;
        }
        return element;
      } })}
    </div>
  </>;

}
