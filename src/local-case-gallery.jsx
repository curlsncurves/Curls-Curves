import React, { useEffect, useState } from 'react';
import './local-case-gallery.css';

const base = '/local-case-gallery/';
const additionalProcedures = new Set([
  'Breast Augmentation by Fat Grafting', 'Brow Lift', 'Buttock Fat Grafting',
  'Chin Augmentation', 'Hip Dip Correction', 'Inverted Nipples',
  'Labia Majora Augmentation', 'Labiaplasty', 'Thigh Liposuction',
]);

export default function LocalCaseGallery() {
  const [cases, setCases] = useState([]);
  const [procedure, setProcedure] = useState('Rhinoplasty');
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.location.hostname !== '127.0.0.1') return;
    const controller = new AbortController();
    fetch(base + 'manifest.json', { signal: controller.signal })
      .then(response => response.ok ? response.json() : [])
      .then(setCases).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (cases.length && window.location.hash === '#case-comparisons') {
      document.getElementById('case-comparisons')?.scrollIntoView();
    }
  }, [cases]);

  if (!cases.length) return null;
  const categories = [...new Set(cases.flatMap(item => item.procedures))].sort();
  const additional = categories.filter(name => additionalProcedures.has(name));
  const active = categories.includes(procedure) ? procedure : categories[0];
  const matches = cases.filter(item => item.procedures.includes(active));
  const selected = matches[index];
  const move = direction => setIndex(current => (current + direction + matches.length) % matches.length);

  return <section id="case-comparisons" className="local-case-gallery" aria-labelledby="local-case-title">
    <div className="container">
      <div className="local-case-heading">
        <div><h2 id="local-case-title">Before &amp; After Case Gallery</h2>
          <p>{cases.length} comparisons across {categories.length} procedures · Local clinic review</p>
          {additional.length > 0 && <p>Choose <strong>Additional procedures</strong> in the menu to see galleries beyond the featured tabs.</p>}</div>
        <label>Procedure<select value={active} onChange={event => {
          setProcedure(event.target.value);
          setIndex(0);
          setVisible(false);
        }}>
          <optgroup label="Featured procedure categories">
            {categories.filter(name => !additionalProcedures.has(name)).map(name => <option key={name}>{name}</option>)}
          </optgroup>
          {additional.length > 0 && <optgroup label="Additional procedures">
            {additional.map(name => <option key={name}>{name}</option>)}
          </optgroup>}
        </select></label>
      </div>
      <div className="local-case-stage">
        <h3>{active}</h3>
        {visible ? <div className="local-case-photos" key={selected.id}>
          {selected.photos.map(photo => <figure key={photo.file}>
            <img src={base + photo.file} alt={photo.label} width={photo.width} height={photo.height} />
            <figcaption>{photo.label}</figcaption>
          </figure>)}
        </div> : <div className="local-case-gate">
          <p>Some comparisons contain clinical nudity.</p>
          <button type="button" className="clinic-page-action" onClick={() => setVisible(true)}>Show clinical photos</button>
        </div>}
        <div className="local-case-controls">
          <button type="button" aria-label="Previous comparison" onClick={() => move(-1)} disabled={matches.length < 2}>‹</button>
          <p role="status">Comparison {index + 1} of {matches.length}</p>
          <button type="button" aria-label="Next comparison" onClick={() => move(1)} disabled={matches.length < 2}>›</button>
        </div>
      </div>
      <p className="local-case-disclaimer">Results vary by individual.</p>
    </div>
  </section>;
}
