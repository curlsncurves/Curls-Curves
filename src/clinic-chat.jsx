import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { answerClinicChat, chatPrompts } from './clinic-chat-answers.js';
import ConsultationForm from './consultation-form.jsx';
import catalog from './catalog.json';
import './clinic-chat.css';

const greeting = { text: 'Hi, I’m the Curls & Curves website assistant. Ask about a procedure, our location, or how to request a consultation. Please avoid sharing personal or medical details here.' };
const maxLength = 240;
const shortcuts = [
  ['Before & After', '/before-after.php'], ['Doctor profile', '/about-doctor.php'],
  ['Blogs', '/blog.php'], ['Patient guides', '/guides'],
  ['Clinic facilities', '/clinic'], ['Directions', 'https://www.google.com/maps/search/?api=1&query=Curls+and+Curves+Vijayanagar+Bengaluru'],
  ['Call the clinic', 'tel:+919480281652'], ['WhatsApp', 'https://wa.me/919480281652'],
];
const categories = [...new Set(catalog.procedures.map(item => item.category))];


export default function ClinicChat() {
  const { key } = useLocation();
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState(null);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState([]);
  const sequence = useRef(0);
  const lastProcedure = useRef();
  const toggle = useRef(null);
  const input = useRef(null);
  const bookingBack = useRef(null);
  const transcript = useRef(null);

  useEffect(() => { setOpen(false); setBooking(null); }, [key]);
  useEffect(() => {
    if (!open) return;
    (booking ? bookingBack : input).current?.focus({ preventScroll: true });
  }, [open, booking]);
  useEffect(() => {
    if (open && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [open, turns]);

  function close() {
    setOpen(false);
    setBooking(null);
    toggle.current?.focus({ preventScroll: true });
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
  function book(href) {
    setBooking(new URL(href, window.location.origin).searchParams.get('procedure') || 'general');
  }
  function reply({ text, links }) {
    return <div className="clinic-chat-reply">
      <p>{text}</p>
      {links?.length > 0 && <div className="clinic-chat-links">{links.map(({ label, href }) => /^\/contact(?:\?|$)/.test(href)
        ? <button key={href} type="button" onClick={() => book(href)}>{label}</button>
        : href.startsWith('/')
        ? <Link key={href} to={href} onClick={() => setOpen(false)}>{label}</Link>
        : <a key={href} href={href}>{label}</a>)}</div>}
    </div>;
  }
  return <aside className="clinic-chat" aria-label="Clinic chat">
    {open && <section id="clinic-chat-panel" className="clinic-chat-panel" aria-labelledby="clinic-chat-title"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          close();
        }
      }}>
      <div className="clinic-chat-header">
        <h2 id="clinic-chat-title">Curls &amp; Curves Assistant</h2>
        <button type="button" aria-label="Close chat" onClick={close}>×</button>
      </div>
      {booking ? <div className="clinic-chat-booking">
        <button ref={bookingBack} type="button" onClick={() => setBooking(null)}>Back to chat</button>
        <h3>Request a consultation</h3>
        <ConsultationForm procedure={booking} />
      </div> : <>
      <details className="clinic-chat-menu">
        <summary>Explore clinic services</summary>
        <div className="clinic-chat-menu-body">
          <button type="button" onClick={() => book('/contact')}>Request a consultation</button>
          {shortcuts.map(([label, href]) => href.startsWith('/')
            ? <Link key={href} to={href}>{label}</Link> : <a key={href} href={href}>{label}</a>)}
          {categories.map(category => <details key={category}><summary>{category.toLowerCase()}</summary>
            {catalog.procedures.filter(item => item.category === category).map(item =>
              <Link key={item.slug} to={'/procedure/' + item.slug}>{item.title}</Link>)}
          </details>)}
        </div>
      </details>
      <div className="clinic-chat-transcript" role="log" aria-label="Chat messages" aria-live="polite" ref={transcript} tabIndex={0}>
        {reply(greeting)}
        {turns.map(turn => <div className="clinic-chat-turn" key={turn.id}>
          <p className="clinic-chat-question">{turn.question}</p>{reply(turn.reply)}
        </div>)}
      </div>
      {turns.length === 0 && <div className="clinic-chat-prompts">
        {chatPrompts.map(prompt => <button key={prompt} type="button" onClick={() => ask(prompt)}>{prompt}</button>)}
      </div>}
      <form className="clinic-chat-form" onSubmit={event => {
        event.preventDefault();
        ask(draft);
      }}>
        <input ref={input} aria-label="Your question" placeholder="Ask about the clinic…" value={draft}
          maxLength={maxLength} onChange={event => setDraft(event.target.value)} autoComplete="off" />
        <button type="submit" disabled={!draft.trim()}>Send</button>
      </form>
      </>}
    </section>}
    {!open && <button className="clinic-chat-invitation" type="button" onClick={() => setOpen(true)}>
      <span>Hello there 👋, chat with us!</span><strong>Chat Now</strong>
    </button>}
    <button type="button" className="clinic-chat-toggle" ref={toggle} aria-expanded={open}
      aria-label={open ? 'Close chat' : 'Chat with us'} aria-controls={open ? 'clinic-chat-panel' : undefined} onClick={() => open ? close() : setOpen(true)}>
      {open ? '×' : <img src="/reference-site/0b553c914ecf8e4ea752.png" alt="" width="36" height="36" />}
    </button>
  </aside>;
}
