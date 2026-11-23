import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ClinicChatProvider from './clinic-chat-provider.jsx';
import { flushSync } from 'react-dom';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import catalog from './catalog.json';
import fallbackStyle from './style.css?url';
import ReferenceSite, { referencePage } from './reference-site.jsx';
import { updatePageHead } from './blog-seo.js';
import CaseGallery from './case-gallery.jsx';
import { prepareReferencePage } from './reference-loading.js';
import { useSiteMotion } from './site-motion.js';
import { procedurePath } from './procedure-routes.js';

const phone = '+919480281652';
const displayPhone = '+91 94802 81652';
const whatsapp = 'https://wa.me/919480281652';
const maps = 'https://www.google.com/maps/search/?api=1&query=Curls+and+Curves+Vijayanagar+Bengaluru';
const address = '#15, 8th Cross Road, MC Layout, Vijayanagar, Bengaluru 560040';
const navigation = [['/', 'Home'], ['/procedures', 'Procedures'], ['/guides', 'Patient guides'], ['/about', 'Our surgeon'], ['/clinic', 'The clinic'], ['/contact', 'Contact']];
const popular = [
  ['rhinoplasty', 'Rhinoplasty', 'Face surgery', 'rhinoplasty', 'Explore changes to nasal shape, structure and facial balance.'],
  ['deep-plane-facelift-facial-rejuvenation', 'Facelift', 'Face surgery', 'facelift', 'Discuss facial and neck rejuvenation options with your surgeon.'],
  ['breast-augmentation', 'Breast Augmentation', 'Breast surgery', 'breast-augmentation', 'Discuss your goals, available approaches and what recovery involves.'],
  ['liposuction', 'Liposuction', 'Body contouring', 'liposuction', 'Explore surgical body contouring for specific areas.'],
];
const questions = [
  ['What happens at my first consultation?', 'You’ll have time to discuss your goals, ask questions and review your health history. Your surgeon can explain suitable options, alternatives, risks and the recovery you may need to plan for.'],
  ['How do I find the right procedure?', 'Start with the procedure directory or request a general consultation. The clinic can help you identify questions to discuss with the surgeon before making a decision.'],
  ['How much time should I allow for recovery?', 'Recovery varies by procedure and individual circumstances. Ask when you may be able to return to work, exercise, travel and other daily activities.'],
  ['Where is the clinic located?', address + '. You can find directions and direct contact options on the Contact page.'],
];
const journey = [
  ['Consultation', 'Discuss what you want to understand or change.'],
  ['Treatment planning', 'Review the options, potential risks and expected recovery.'],
  ['Preparing for care', 'Get instructions for your procedure and plan practical support.'],
  ['Follow-up', 'Discuss recovery milestones and your follow-up schedule.'],
];

function Kicker({ children }) { return <p className="kicker">{children}</p>; }
function Action({ children, to = '/contact', secondary = false }) {
  return <Link className={secondary ? 'button secondary' : 'button'} to={to}>{children}</Link>;
}
function Brand() {
  return <Link className="brand" to="/" aria-label="Curls & Curves home">
    <span className="mark" aria-hidden="true">C<span>&</span>C</span>
    <span>Curls <i>&</i> Curves<small>Cosmetic Surgery Centre</small></span>
  </Link>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.key]);
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <div className="utility"><div className="wrap"><a href={maps}>Vijayanagar, Bengaluru</a><a href={'tel:' + phone}>{displayPhone}</a></div></div>
    <header onKeyDown={event => { if (event.key === 'Escape' && open) { setOpen(false); event.currentTarget.querySelector('button')?.focus(); } }}>
      <div className="wrap nav-row">
        <Brand />
        <button className="menu" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
        <nav id="site-nav" className={open ? 'open' : ''} aria-label="Main navigation">
          {navigation.map(([href, text]) => <NavLink key={href} to={href} end={href === '/'}>{text}</NavLink>)}
          <Action>Request consultation</Action>
        </nav>
      </div>
    </header>
  </>;
}
function Footer() {
  return <footer><div className="wrap footer-grid">
    <div><Brand /><p>{address}</p></div>
    <div><h2>Explore</h2>{navigation.slice(1).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div>
    <div><h2>Get in touch</h2><a href={'tel:' + phone}>{displayPhone}</a><a href={whatsapp}>WhatsApp</a><a href={maps}>Get directions</a></div>
  </div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Curls & Curves</span><span>Information on this site is for patient education.</span></div></footer>;
}
function PageLead({ label, title, text }) {
  return <section className="page-lead"><div className="wrap"><Kicker>{label}</Kicker><h1>{title}</h1>{text && <p className="lede">{text}</p>}</div></section>;
}
function ConsultationBand() {
  return <section className="section cta"><div className="wrap split-line" data-reveal><div><Kicker>Consultations</Kicker><h2>Let’s talk about your options.</h2><p>Meet the surgeon and discuss what matters to you.</p></div><Action>Request consultation</Action></div></section>;
}
function Profile() {
  return <section className="section profile"><div className="wrap profile-grid" data-reveal>
    <div className="portrait"><img src="/media/doctor.webp" alt="Dr. Girish A C" loading="lazy" /></div>
    <div><Kicker>Meet your surgeon</Kicker><h2>Dr. Girish A C</h2><p className="lede">Cosmetic and plastic surgeon</p><p>Dr. Girish leads the team at Curls & Curves. A consultation gives you time to discuss your goals and understand the options available to you.</p><Action to="/about" secondary>View surgeon profile</Action></div>
  </div></section>;
}
function FAQ() {
  return <section className="section"><div className="wrap faq" data-reveal><div><Kicker>Common questions</Kicker><h2>Before your visit</h2></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>;
}
function Home() {
  return <>
    <section className="hero"><div className="wrap hero-grid">
      <div className="hero-copy"><Kicker>Cosmetic surgery centre · Bengaluru</Kicker><h1>Cosmetic care.<br /><em>Centred on you.</em></h1><p className="lede">Explore personalised cosmetic surgery and aesthetic care with Dr. Girish A C in Vijayanagar, Bengaluru.</p><div className="actions"><Action>Request consultation</Action><Action to="/procedures" secondary>Explore procedures</Action></div></div>
      <div className="hero-image"><div className="hero-arch" /><img src="/media/hero.webp" alt="" fetchPriority="high" width="1200" height="1086" /></div>
    </div></section>
    <div className="hero-note"><div className="wrap"><span>Private consultations</span><span>Individual treatment planning</span><span>Recovery and follow-up guidance</span></div></div>
    <section className="section specialties"><div className="wrap">
      <div className="split-line" data-reveal><div><Kicker>Our specialties</Kicker><h2>Explore popular procedures</h2></div><Action to="/procedures" secondary>View all procedures</Action></div>
      <div className="procedure-grid">{popular.map(([slug, title, category, image, description]) => <Link className="procedure-card" key={slug} to={'/procedure/' + slug} data-reveal>
        <div className="card-image"><img src={'/media/' + image + '.webp'} alt="" loading="lazy" /></div><div className="card-body"><Kicker>{category}</Kicker><h3>{title}</h3><p>{description}</p></div>
      </Link>)}</div>
    </div></section>
    <Profile />
    <section className="section"><div className="wrap" data-reveal><Kicker>Your care</Kicker><h2>What to expect</h2><div className="journey">{journey.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>
    <FAQ /><ConsultationBand />
  </>;
}
function GuideDirectory() {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const matched = catalog.guides.filter(item => item.title.toLowerCase().includes(query));
  return <>
    <PageLead label="Patient education" title="Patient guides" text="Prepare questions for your consultation and learn what to discuss before choosing treatment." />
    <section className="section"><div className="wrap">
      <div className="filters"><label>Search guides<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by guide name" /></label></div>
      <p className="result-count" role="status">{matched.length} guides</p>
      <div className="directory">{matched.map(item => <Link to={'/guide/' + item.slug} key={item.slug}><Kicker>Consultation guide</Kicker><h3>{item.title}</h3></Link>)}</div>
      {!matched.length && <button className="button secondary" onClick={() => setSearch('')}>Clear filters</button>}
    </div></section>
  </>;
}
function GuideDetail({ item }) {
  const related = catalog.procedures.find(entry => entry.slug === item.slug);
  return <>
    <PageLead label="Consultation guide" title={item.title} text="Use these prompts to prepare for a conversation with your surgeon." />
    <section className="section"><div className="wrap detail-grid"><article>
      <h2>Questions to bring</h2>
      <ul className="question-list">
        <li>What can {item.title.toLowerCase()} address in my case?</li>
        <li>What are the available approaches and alternatives?</li>
        <li>What risks are most relevant to my health and circumstances?</li>
        <li>What will recovery and follow-up involve?</li>
      </ul>
      {related && <Link className="inline-link" to={procedurePath(related.slug)}>View procedure overview</Link>}
    </article><aside className="panel"><h3>Speak to the clinic</h3><p>Ask about a consultation for {item.title.toLowerCase()}.</p><Action to={related ? '/contact?procedure=' + related.slug : '/contact'}>Request consultation</Action><a className="inline-link" href={'tel:' + phone}>{displayPhone}</a></aside></div></section>
  </>;
}
function About() {
  return <>
    <PageLead label="Our surgeon" title="Dr. Girish A C" text="Cosmetic and plastic surgeon at Curls & Curves." />
    <section className="section"><div className="wrap profile-grid">
      <div className="portrait"><img src="/media/doctor.webp" alt="Dr. Girish A C" /></div>
      <div><h2>Education</h2><ul className="question-list"><li>MBBS, JJM Medical College, Davanagere</li><li>MS in General Surgery, JN Medical College, Belagavi</li><li>MCh in Plastic Surgery, Bangalore Medical College & Research Institute</li></ul><Action to="/clinic" secondary>Explore the clinic</Action></div>
    </div></section><ConsultationBand />
  </>;
}
function Clinic() {
  const [photo, setPhoto] = useState(null);
  const dialog = useRef(null);
  function show(index) {
    setPhoto(index);
    if (!dialog.current.open) dialog.current.showModal();
  }
  function next(direction) { setPhoto(index => (index + direction + catalog.clinic.length) % catalog.clinic.length); }
  const active = photo === null ? null : catalog.clinic[photo];
  return <>
    <PageLead label="Clinic and facilities" title="Inside Curls & Curves" text="Explore our consultation rooms, reception and clinic facilities in Vijayanagar." />
    <section className="section"><div className="wrap clinic-grid">
      {catalog.clinic.map(({ file, alt }, index) => <button className="clinic-card" key={file} onClick={() => show(index)}><img src={'/media/' + file} alt="" loading="lazy" /><span>{alt}</span></button>)}
    </div></section>
    <dialog ref={dialog} aria-label="Clinic photo gallery" onClose={() => setPhoto(null)} onKeyDown={event => {
      if (event.key === 'ArrowRight') next(1);
      if (event.key === 'ArrowLeft') next(-1);
    }}>{active && <div className="lightbox"><button className="button secondary close" autoFocus onClick={() => dialog.current.close()}>Close</button><img src={'/media/' + active.file} alt={active.alt} /><div className="lightbox-nav"><button className="button secondary" onClick={() => next(-1)}>Previous</button><p aria-live="polite">{active.alt} · {photo + 1} / {catalog.clinic.length}</p><button className="button secondary" onClick={() => next(1)}>Next</button></div></div>}</dialog>
    <ConsultationBand />
  </>;
}
function App() {
  const motionLocation = useLocation();
  useSiteMotion(null, motionLocation.key);
  const { pathname, key } = useLocation();
  const path = pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/';
  const guideSlug = path.match(/^\/guide\/([^/]+)$/)?.[1];
  const item = catalog.guides.find(entry => entry.slug === guideSlug);
  const titles = { '/procedures': 'Cosmetic procedures', '/guides': 'Patient guides', '/about': 'Dr. Girish A C', '/clinic': 'Clinic and facilities', '/contact': 'Request a consultation', '/before-after': 'Treatment outcomes' };
  useEffect(() => {
    document.title = (item?.title || titles[path] || 'Cosmetic Surgery Centre, Bengaluru') + ' | Curls & Curves';
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (key !== 'default' && !window.location.hash) document.getElementById('main')?.focus({ preventScroll: true });
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(records => records.forEach(record => {
      if (!record.isIntersecting) return;
      record.target.classList.add('revealed');
      observer.unobserve(record.target);
    }), { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [key, path]);
  let page;
  if (item) page = <GuideDetail item={item} />;
  else if (path === '/' || path === '/index') page = <Home />;
  else if (path === '/guides') page = <GuideDirectory />;
  else if (path === '/about') page = <About />;
  else if (path === '/clinic') page = <Clinic />;
  else if (path === '/before-after') page = <><PageLead label="Treatment outcomes" title="Discuss results with your surgeon" text="Ask the clinic about representative outcomes and what may be realistic for your individual circumstances." /><CaseGallery /><ConsultationBand /></>;
  else page = <><PageLead label="Page unavailable" title="We couldn’t find that page." /><section className="section"><div className="wrap"><Action to="/">Return home</Action></div></section></>;
  return <><Header /><main key={key} id="main" tabIndex={-1}>{page}</main><Footer /></>;
}

function RoutedSite({ initialPage }) {
  const { pathname } = useLocation();
  useEffect(() => updatePageHead(pathname), [pathname]);
  const source = referencePage(pathname);
  return source ? <ReferenceSite key={pathname} source={source} initialPage={initialPage} /> : <><link rel="stylesheet" href={fallbackStyle} /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" /><App /></>;
}

function PreparedRoutes() {
  const location = useLocation();
  const [displayed, setDisplayed] = useState({ location, page: null });
  useEffect(() => {
    const source = referencePage(location.pathname);
    if (location.pathname === displayed.location.pathname) {
      if (location !== displayed.location) setDisplayed({ location, page: displayed.page });
      return;
    }
    let live = true;
    const prepared = source ? prepareReferencePage(source) : Promise.resolve(null);
    prepared.then(page => {
      if (!live) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || reduced) {
        setDisplayed({ location, page });
        return;
      }
      const transition = document.startViewTransition(() => {
        if (live) flushSync(() => setDisplayed({ location, page }));
      });
      transition.finished.catch(() => {
        if (live) setDisplayed({ location, page });
      });
    }).catch(() => {
      if (live) setDisplayed({ location, page: null });
    });
    return () => { live = false; };
  }, [location, displayed]);

  return <Routes location={displayed.location}>
    <Route path="*" element={<RoutedSite initialPage={displayed.page} />} />
  </Routes>;
}

createRoot(document.getElementById('root')).render(<BrowserRouter><PreparedRoutes /><ClinicChatProvider /></BrowserRouter>);
