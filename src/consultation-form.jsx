import React, { useRef, useState } from 'react';
import catalog from './catalog.json';

const procedures = [...catalog.procedures].sort((a, b) => a.title.localeCompare(b.title));

export default function ConsultationForm({ procedure }) {
  const selected = procedures.some(item => item.slug === procedure) ? procedure : 'general';
  const [status, setStatus] = useState({ type: 'idle' });
  const pending = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    pending.current = true;
    setStatus({ type: 'pending' });
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'),
          topic: data.get('topic'), consent: data.has('consent') }),
      });
      const result = await response.json();
      if (!response.ok || !result.reference) {
        setStatus({ type: 'error', message: result.message || 'Unable to save your request. Please call the clinic.' });
      } else setStatus({ type: 'success', reference: result.reference });
    } catch {
      setStatus({ type: 'error', message: 'Unable to reach the clinic website. Try again or contact the clinic directly.' });
    } finally {
      pending.current = false;
    }
  }

  if (status.type === 'success') return <div className="clinic-form-receipt" role="status">
    <h3>Request received</h3><p>The clinic can contact you to confirm availability.</p><p>Reference {status.reference}</p>
  </div>;

  return <form className="clinic-consultation-form" onSubmit={submit}>
    <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>
    <label>Phone number<input type="tel" name="phone" autoComplete="tel" maxLength={32} required /></label>
    <label>Procedure of interest<select name="topic" defaultValue={selected}>
      <option value="general">General consultation</option>
      {procedures.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}
    </select></label>
    <label className="clinic-consultation-consent"><input type="checkbox" name="consent" required />
      <span>I agree to share these details with the clinic so it can contact me about my request.</span>
    </label>
    {status.type === 'error' && <p role="alert">{status.message}</p>}
    <button className="clinic-page-action" disabled={status.type === 'pending'}>
      {status.type === 'pending' ? 'Sending…' : 'Send callback request'}
    </button>
  </form>;
}
