import React from 'react';
import catalog from './catalog.json';
import { consultationEndpoint } from './consultation-endpoint.js';

const procedures = [...catalog.procedures].sort((a, b) => a.title.localeCompare(b.title));

export default function ConsultationForm({ procedure }) {
  const selected = procedures.some(item => item.slug === procedure) ? procedure : 'general';
  if (!consultationEndpoint) return <p>Online requests are currently unavailable. <a href="tel:+919480281652">Call the clinic</a> to request a consultation.</p>;

  return <form className="clinic-consultation-form" action={consultationEndpoint} method="post">
    <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>
    <label>Phone number<input type="tel" name="phone" autoComplete="tel" maxLength={32} required /></label>
    <label>Email (optional)<input type="email" name="email" autoComplete="email" maxLength={254} /></label>
    <label>Procedure of interest<select name="topic" defaultValue={selected}>
      <option value="general">General consultation</option>
      {procedures.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}
    </select></label>
    <label className="clinic-consultation-consent"><input type="checkbox" name="consent" required />
      <span>I agree to share these details with the clinic so it can contact me about my request.</span>
    </label>
    <input type="hidden" name="website" value="" />
    <button className="clinic-page-action">Send callback request</button>
  </form>;
}
