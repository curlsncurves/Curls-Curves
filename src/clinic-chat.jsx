import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { answerClinicChat } from './clinic-chat-answers.js';
import ConsultationForm from './consultation-form.jsx';
import catalog from './catalog.json';
import { procedurePath } from './procedure-routes.js';
import './clinic-chat.css';

const greeting = { text: 'Welcome to Curls & Curves. How can we help? Please keep personal and medical details out of chat.' };
const maxLength = 240;
const shortcuts = [
  ['Before & After', '/before-after.php'], ['Doctor profile', '/about-doctor.php'],
  ['Blogs', '/blog.php'], ['Patient guides', '/guides'],
  ['Clinic facilities', '/clinic'], ['Directions', 'https://www.google.com/maps/search/?api=1&query=Curls+and+Curves+Vijayanagar+Bengaluru'],
  ['Call the clinic', 'tel:+919480281652'], ['WhatsApp', 'https://wa.me/919480281652'],
];
const categories = [...new Set(catalog.procedures.map(item => item.category))];
const logo = '/reference-site/0b553c914ecf8e4ea752.png';
const videoId = 'ZXcLoST-yUY';


export default function ClinicChat() {
  const { key } = useLocation();
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState(null);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const sequence = useRef(0);
  const lastProcedure = useRef();
  const toggle = useRef(null);
  const panel = useRef(null);
  const menu = useRef(null);
  const input = useRef(null);
  const bookingCard = useRef(null);
  const transcript = useRef(null);

  useEffect(() => { setOpen(false); setBooking(null); setShowVideo(false); }, [key]);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus({ preventScroll: true });
    const viewport = window.visualViewport;
    if (!viewport) return;
    const element = panel.current;
    function fitViewport() {
      element.style.setProperty('--chat-viewport-height', viewport.height + 'px');
      element.style.setProperty('--chat-viewport-top', viewport.offsetTop + 'px');
    }
    fitViewport();
    viewport.addEventListener('resize', fitViewport);
    viewport.addEventListener('scroll', fitViewport);
    return () => {
      viewport.removeEventListener('resize', fitViewport);
      viewport.removeEventListener('scroll', fitViewport);
    };
  }, [open]);
  useEffect(() => {
    if (open && turns.length && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [open, turns]);
  useEffect(() => {
    if (!booking || !bookingCard.current) return;
    const scroller = transcript.current;
    scroller.scrollTop += bookingCard.current.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
    bookingCard.current.focus({ preventScroll: true });
  }, [booking]);

  function close() {
    setOpen(false);
    setBooking(null);
    setShowVideo(false);
    requestAnimationFrame(() => toggle.current?.focus({ preventScroll: true }));
  }
  function ask(value) {
    const question = value.trim().slice(0, maxLength);
    if (!question) return;
    const response = answerClinicChat(question, lastProcedure.current);
    if (response.procedure) lastProcedure.current = response.procedure;
    const turn = { id: ++sequence.current, question, reply: response };
    setTurns(previous => [...previous.slice(-19), turn]);
    setDraft('');
    input.current?.focus({ preventScroll: true });
  }
  function book(href, label = 'Book an appointment') {
    const procedure = new URL(href, window.location.origin).searchParams.get('procedure') || 'general';
    const id = ++sequence.current;
    setBooking({ id, procedure });
    setTurns(previous => [...previous.filter(turn => turn.reply).slice(-19), { id, question: label }]);
  }
  function reply({ text, items, links }) {
    return <div className="clinic-chat-reply">
      <p>{text}</p>
      {items?.length > 0 && <ul className="clinic-chat-reply-list">{items.map(item => <li key={item}>{item}</li>)}</ul>}
      {links?.length > 0 && <div className="clinic-chat-links">{links.map(({ label, href }) => /^\/contact(?:\?|$)/.test(href)
        ? <button key={href} type="button" onClick={() => book(href)}>{label}</button>
        : href.startsWith('/')
        ? <Link key={href} to={href} onClick={() => setOpen(false)}>{label}</Link>
        : <a key={href} href={href}>{label}</a>)}</div>}
    </div>;
  }
  return <aside className="clinic-chat" data-open={open} aria-label="Clinic chat">
    {open && <section id="clinic-chat-panel" className="clinic-chat-panel" ref={panel} tabIndex={-1} aria-labelledby="clinic-chat-title"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          close();
        }
      }}>
      <div className="clinic-chat-header">
        <img src={logo} alt="" width="34" height="34" />
        <div><h2 id="clinic-chat-title">Curls &amp; Curves Help Desk</h2><p>Clinic information and consultations</p></div>
        <button type="button" aria-label="Close chat" onClick={close}>×</button>
      </div>
      <details className="clinic-chat-menu" ref={menu}>
        <summary>Explore clinic services</summary>
        <div className="clinic-chat-menu-body">
          <button type="button" onClick={() => book('/contact')}>Request a consultation</button>
          {shortcuts.map(([label, href]) => href.startsWith('/')
            ? <Link key={href} to={href}>{label}</Link> : <a key={href} href={href}>{label}</a>)}
          {categories.map(category => <details key={category}><summary>{category.toLowerCase()}</summary>
            {catalog.procedures.filter(item => item.category === category).map(item =>
              <Link key={item.slug} to={procedurePath(item.slug)}>{item.title}</Link>)}
          </details>)}
        </div>
      </details>
      <div className="clinic-chat-transcript" role="log" aria-label="Chat messages" aria-live="polite" ref={transcript} tabIndex={0}>
        {reply(greeting)}
        {reply({ text: 'Curls & Curves is a cosmetic surgery centre in Vijayanagar, Bengaluru, led by Dr Girish A C.' })}
        <div className="clinic-chat-video">
          {showVideo
            ? <iframe title="Curls & Curves clinic introduction" src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            : <button type="button" className="clinic-chat-video-play" onClick={() => setShowVideo(true)}>
                <img src="/media/reception-lounge-new.webp" width="480" height="270" alt="" />
                <span>▶ <span>Watch the clinic introduction</span></span>
              </button>}
          {showVideo && <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">Open on YouTube</a>}
        </div>
        <div className="clinic-chat-quick" role="group" aria-label="Quick chat actions">
          <p>How may we assist you today?</p>
          <button type="button" onClick={() => { menu.current.open = true; menu.current.querySelector('summary').focus(); }}>Our services</button>
          <button type="button" onClick={() => book('/contact')}>Book an appointment</button>
          <button type="button" onClick={() => { setBooking(null); ask('Request a callback'); }}>Request a callback</button>
          <button type="button" onClick={() => ask('Awards and affiliations')}>Awards and affiliations</button>
        </div>
        {turns.map(turn => <div className="clinic-chat-turn" key={turn.id}>
          <p className="clinic-chat-question">{turn.question}</p>
          {turn.reply ? reply(turn.reply) : booking?.id === turn.id && <section className="clinic-chat-contact-card" ref={bookingCard}
            tabIndex={-1} aria-label="Contact information">
            <div className="clinic-chat-card-heading">
              <h3>Contact information</h3>
              <button type="button" onClick={() => { setBooking(null); input.current?.focus(); }}>Dismiss form</button>
            </div>
            <p>Leave your details for a clinic callback.</p>
            <ConsultationForm procedure={booking.procedure} fromChat />
          </section>}
        </div>)}
      </div>
      <form className="clinic-chat-form" onSubmit={event => {
        event.preventDefault();
        ask(draft);
      }}>
        <input ref={input} aria-label="Your question" placeholder="Type your message…" value={draft}
          maxLength={maxLength} onChange={event => setDraft(event.target.value)} autoComplete="off" />
        <button type="submit" disabled={!draft.trim()}>Send</button>
      </form>
    </section>}
    {!open && <button className="clinic-chat-invitation" type="button" onClick={() => setOpen(true)}>
      <span>Questions about the clinic?</span><strong>Chat with us</strong>
    </button>}
    <button type="button" className="clinic-chat-toggle" ref={toggle} aria-expanded={open}
      aria-label={open ? 'Close chat' : 'Chat with us'} aria-controls={open ? 'clinic-chat-panel' : undefined} onClick={() => open ? close() : setOpen(true)}>
      {open ? '×' : <img src={logo} alt="" width="36" height="36" />}
    </button>
  </aside>;
}
