import React from 'react';
import { Link } from 'react-router-dom';
import catalog from './catalog.json';
import { educationFor } from './procedure-education.js';
import './procedure-education.css';

export default function ProcedureEducation({ title, entry, slug }) {
  const topic = catalog.procedures.find(item => item.slug === slug) ||
    catalog.procedures.find(item => educationFor(item.slug) === entry);
  const [image, alt, type] = entry.image;
  return <section className="procedure-education" aria-labelledby="education-title">
    <div className="container education-wrap">
      <div className="education-hero">
        <div>
          <p className="education-category">{entry.category}</p>
          <h1 id="education-title">{title}</h1>
          <p>{entry.overview}</p>
          <Link className="education-action" to={topic ? '/contact?procedure=' + topic.slug : '/contact'}>
            Request a consultation
          </Link>
        </div>
        <figure className={type === 'diagram' ? undefined : 'education-cutout'}>
          <img src={image} alt={alt} width="720" height="470" decoding="async" />
          <figcaption>{type === 'diagram' ? 'Anatomical illustration' : type === 'portrait' ? 'AI-generated illustrative portrait' : 'Illustrative photo'}</figcaption>
        </figure>
      </div>
      <div className="education-details">
        <article><h2>What to discuss</h2><p>{entry.assessment}</p></article>
        <article><h2>Recovery and follow-up</h2><p>{entry.recovery}</p></article>
        <article><h2>Risks to consider</h2><p>{entry.risks}</p></article>
      </div>
      <div className="education-sources">
        <h2>Patient information sources</h2>
        <ul>{entry.sources.map(([name, url]) => <li key={url}><a href={url}>{name}</a></li>)}</ul>
      </div>
    </div>
  </section>;
}
