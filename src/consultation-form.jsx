import React from 'react';
import catalog from './catalog.json';
import { consultationEndpoint } from './consultation-endpoint.js';

const procedures = [...catalog.procedures].sort((a, b) => a.title.localeCompare(b.title));

export default function ConsultationForm({ procedure, fromChat = false }) {
  const selected = procedures.some(item => item.slug === procedure) ? procedure : 'general';
  const useWhatsApp = !consultationEndpoint;

  function openWhatsApp(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = ['Hello, I would like to request a clinic callback.',
      'Name: ' + data.get('name').trim(), 'Mobile: ' + data.get('phone').trim()];
    for (const [field, label] of [['email', 'Email'], ['city', 'City']]) {
      const value = data.get(field)?.trim();
      if (value) lines.push(label + ': ' + value);
    }
    const topic = procedures.find(item => item.slug === data.get('topic'))?.title;
    if (topic) lines.push('Procedure: ' + topic);
    window.open('https://wa.me/919480281652?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener,noreferrer');
  }

  return <form className="clinic-consultation-form" action={consultationEndpoint || undefined} method="post"
    onSubmit={useWhatsApp ? openWhatsApp : undefined}>
    {useWhatsApp && <div className="clinic-form-notice">
      <p>{fromChat ? 'Submit opens WhatsApp so you can review and send your callback request.' : 'Continue to WhatsApp to review and send your callback request.'}</p>
      <a href="tel:+919480281652">Call the clinic</a>
    </div>}
    <fieldset aria-label="Callback details">
    <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>
    <label>Email (optional)<input type="email" name="email" autoComplete="email" maxLength={254} /></label>
    <label>Mobile number<input type="tel" name="phone" autoComplete="tel" maxLength={32} required /></label>
    {fromChat && <label>City (optional)<input name="city" autoComplete="address-level2" maxLength={80} /></label>}
    <label>Procedure of interest<select name="topic" defaultValue={selected}>
      <option value="general">General consultation</option>
      {procedures.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}
    </select></label>
    <label className="clinic-consultation-consent"><input type="checkbox" name="consent" required />
      <span>I agree to share these details with the clinic so it can contact me about my request.</span>
    </label>
    <input type="hidden" name="website" value="" />
    <button type="submit" className="clinic-page-action">{fromChat ? 'Submit' : useWhatsApp ? 'Continue to WhatsApp' : 'Send callback request'}</button>
    </fieldset>
  </form>;
}
