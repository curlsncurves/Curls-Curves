import { useEffect } from 'react';

const cardSelector = '.procedure-card, .feature-item, .journey-step, .why-card, .process-step, .type-card, .blog-card, .latest-card, .more-card, .filter-card, .clinic-card, .related-card, .accreditation-card, .directory > a, .journey > div, .clinic-blog-card, .clinic-page-card, .clinic-local-links li, .stat-box, .stat-item, .doctor-credential, .education-details article, .timeline-item, .step-item';
const heroSelector = '.hero, .service-hero, .ba-hero, .blog-hero, .doctor-hero, .page-lead, .education-hero, .clinic-page-lead';
const sectionSelector = 'section, footer';

export function useSiteMotion(rootRef, ready) {
  useEffect(() => {
    const root = rootRef?.current || document.getElementById('root');
    if (!ready || !root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    // Scroll progress & sticky header
    let frame = 0;
    const header = root.querySelector('.site-header, header');
    const updateScrollMetrics = () => {
      frame = 0;
      const scrollY = window.scrollY;
      header?.classList.toggle('motion-header-scrolled', scrollY > 28);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight).toFixed(4) : 0;
      document.documentElement.style.setProperty('--scroll-percent', progress);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollMetrics);
    };

    updateScrollMetrics();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!('IntersectionObserver' in window)) {
      return () => {
        window.removeEventListener('scroll', onScroll);
        if (frame) window.cancelAnimationFrame(frame);
      };
    }

    // Hero element staggered entrances
    root.querySelectorAll(heroSelector).forEach(hero => {
      const elements = [...hero.querySelectorAll('h1, h1 + p, h2, .kicker, .hero-subtitle, .hero-desc, .hero-buttons, .hero-cta, .hero-actions, .actions, .education-action, img, .hero-note, .hero-arch')];
      elements.forEach((element, index) => {
        element.style.setProperty('--motion-delay', Math.min(index, 6) * 55 + 'ms');
        element.classList.add(element.tagName === 'IMG' || element.classList.contains('hero-arch') ? 'motion-hero-image' : 'motion-hero-text');
      });
    });

    // Intersection observer for section items & cards
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('motion-revealed');
        observer.unobserve(target);
      }
    }, { rootMargin: '0px 0px -25px', threshold: 0.04 });

    const queried = new Set();
    function observe(element, type, delay = 0) {
      if (queried.has(element)) return;
      queried.add(element);
      element.dataset.motion = type;
      if (delay) element.style.setProperty('--motion-delay', delay + 'ms');
      observer.observe(element);
    }

    root.querySelectorAll(sectionSelector).forEach(section => {
      if (section.matches(heroSelector)) return;
      const cards = [...section.querySelectorAll(cardSelector)];
      cards.forEach((card, index) => observe(card, 'card', (index % 6) * 55));
      section.querySelectorAll('h2, .section-title, .section-desc, .section-subtitle, .section-intro, .footer-col, .footer-bottom, .section-title + p, .split-line > div').forEach(element => {
        if (!element.closest(cardSelector)) observe(element, 'text');
      });
      section.querySelectorAll('img').forEach((element, index) => {
        if (!element.closest(cardSelector + ', .trans-slides, .review-slide, .story-card, .modal-overlay') &&
            !element.matches('.t-slide') && element.clientWidth > 90) {
          observe(element, index % 2 ? 'image-right' : 'image-left');
        }
      });
    });

    root.querySelectorAll('.clinic-article > :is(h1, .clinic-page-category, .clinic-article-status, figure, section)').forEach((element, index) => {
      observe(element, element.matches('figure') ? 'article-image' : 'text', index * 40);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rootRef, ready]);
}
