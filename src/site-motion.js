import { useEffect } from 'react';

const cardSelector = '.procedure-card, .feature-item, .journey-step, .why-card, .process-step, .type-card, .blog-card, .latest-card, .more-card, .filter-card, .clinic-card, .related-card, .accreditation-card, .directory > a, .journey > div, .clinic-blog-card, .clinic-page-card, .clinic-local-links li';
const heroSelector = '.hero, .service-hero, .ba-hero, .blog-hero, .doctor-hero, .page-lead, .education-hero, .clinic-page-lead';
const sectionSelector = 'section, footer';

export function useSiteMotion(rootRef, ready) {
  useEffect(() => {
    const root = rootRef?.current || document.getElementById('root');
    if (!ready || !root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !('IntersectionObserver' in window)) return;

    root.querySelectorAll(heroSelector).forEach(hero => {
      const elements = [...hero.querySelectorAll('h1, h1 + p, h2, .hero-subtitle, .hero-desc, .hero-buttons, .hero-cta, .hero-actions, .actions, .education-action, img')];
      elements.forEach((element, index) => {
        element.style.setProperty('--motion-delay', Math.min(index, 5) * 46 + 'ms');
        element.classList.add(element.tagName === 'IMG' ? 'motion-hero-image' : 'motion-hero-text');
      });
    });

    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('motion-revealed');
        observer.unobserve(target);
      }
    }, { rootMargin: '0px 0px -15px', threshold: 0 });

    const queried = new Set();
    function observe(element, type, delay = 0) {
      if (queried.has(element)) return;
      queried.add(element);
      element.dataset.motion = type;
      if (delay) element.style.setProperty('--motion-delay', delay + 'ms');
      observer.observe(element);
    }

    root.querySelectorAll(sectionSelector).forEach(section => {
      if (section.matches(heroSelector) || section.closest('.case-gallery')) return;
      const cards = [...section.querySelectorAll(cardSelector)];
      cards.forEach((card, index) => observe(card, 'card', index % 4 * 42));
      section.querySelectorAll('h2, .section-title, .section-desc, .section-subtitle, .section-intro, .footer-col, .footer-bottom, .section-title + p').forEach(element => {
        if (!element.closest(cardSelector) && !element.closest('.case-gallery')) observe(element, 'text');
      });
      section.querySelectorAll('img').forEach((element, index) => {
        if (!element.closest(cardSelector + ', .case-gallery, .trans-slides, .review-slide, .story-card, .modal-overlay') &&
            !element.matches('.t-slide') && element.clientWidth > 90) observe(element, index % 2 ? 'image-right' : 'image-left');
      });
    });
    root.querySelectorAll('.clinic-article > :is(h1, .clinic-page-category, .clinic-article-status, figure)').forEach((element, index) => {
      observe(element, element.matches('figure') ? 'article-image' : 'text', index * 35);
    });

    const header = root.querySelector('.site-header');
    let frame = 0;
    const updateHeader = () => {
      frame = 0;
      header?.classList.toggle('motion-header-scrolled', window.scrollY > 34);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateHeader); };
    if (header) {
      updateHeader();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rootRef, ready]);
}
