import React, { useEffect, useRef, useState } from 'react';
import './case-gallery.css';

const FEATURED = [
  ['Rhinoplasty', 'Rhinoplasty'],
  ['Combined Face and Neck Rejuvenation', 'Face'],
  ['Breast Augmentation', 'Breast Augmentation'],
  ['Dimple Creation', 'Dimple Creation'],
];
const FACE_GROUPS = new Set([FEATURED[0][0], FEATURED[1][0], FEATURED[3][0], 'Blepharoplasty', 'Brow Lift', 'Chin Augmentation']);

function slug(value) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/-$/, '');
}

export function caseProcedure(pathname) {
  if (/^\/before-after(?:\.php|\.html)?\/?$/.test(pathname)) return '';
  const name = pathname.split('/').filter(Boolean).at(-1)?.replace(/^service-/, '')
    .replace(/(?:\.php|\.html)$/, '').replace(/-in-bangalore$/, '');
  if (!name) return null;
  if (/^(?:deep-plane-face-?lift(?:-facial-rejuvenation)?|neck-face-lift)$/.test(name)) return 'combined-face-and-neck-rejuvenation';
  if (/^liposuction$|^3d-liposuction$|^hd-liposuction$|^ultrasonic-liposuction$/.test(name)) return '3d-hd-and-ultrasonic-liposuction';
  if (name === 'rhinoplasty-surgery') return 'rhinoplasty';
  if (name === 'brow-lift-forehead-lift') return 'brow-lift';
  if (name === 'dimple-creation-surgery') return 'dimple-creation';
  if (/breast-(?:augmentation|fat-transfer).*(?:fat|transfer)/.test(name) || name === 'breast-fat-transfer') return 'breast-augmentation-by-fat-grafting';
  if (name === 'gynecomastia-surgery') return 'gynecomastia';
  return name;
}

export default function CaseGallery({ procedure = '' }) {
  const section = useRef(null);
  const [cases, setCases] = useState([]);
  const [category, setCategory] = useState('');
  const [current, setCurrent] = useState(0);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/case-gallery', { signal: controller.signal }).then(async response => {
      if (response.status === 404) return;
      if (!response.ok) throw new Error('Cannot load gallery');
      setCases((await response.json()).cases);
    }).catch(failure => { if (failure.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, []);

  const groups = [...new Set(cases.flatMap(item => item.procedures))].sort((a, b) => a.localeCompare(b));
  const tabs = FEATURED.filter(([name]) => groups.includes(name));
  const active = procedure ? groups.find(name => slug(name) === procedure) : category || tabs[0]?.[0] || groups[0];
  const matches = cases.filter(item => item.procedures.includes(active));
  const ready = matches.length > 0;
  useEffect(() => {
    if (ready && window.location.hash === '#case-comparisons') section.current?.scrollIntoView();
  }, [ready]);

  if (error) return <p className="case-gallery-error">The local case gallery could not be loaded.</p>;
  if (!ready) return null;

  const selected = matches[current];
  const showPhotos = FACE_GROUPS.has(active) || consented;
  function choose(name) {
    setCategory(name);
    setCurrent(0);
    setConsented(false);
  }
  function step(direction) {
    setCurrent(index => (index + direction + matches.length) % matches.length);
  }

  return <section ref={section} id="case-comparisons" className="case-gallery" aria-labelledby="case-gallery-title">
    <div className="container">
      <div className="case-header">
        <h2 id="case-gallery-title" className="section-title">Real Transformations</h2>
        {procedure ? <a className="case-all-link" href="/before-after.php#case-comparisons">View all Before & After results</a> :
          <label className="case-filter">
            <span>All procedures</span>
            <select value={active} onChange={event => choose(event.target.value)}>
              {groups.map(name => <option key={name}>{name}</option>)}
            </select>
          </label>}
      </div>
      {!procedure && <div className="case-tabs" role="group" aria-label="Featured procedures">
        {tabs.map(([name, label]) => <button key={name} type="button" aria-pressed={active === name}
          onClick={() => choose(name)}>{label}</button>)}
      </div>}
      <div className="case-stage" role="group" aria-label="Photo comparisons"
        onKeyDown={event => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          step(event.key === 'ArrowLeft' ? -1 : 1);
        }}>
        <h3 className="case-procedure">{active}</h3>
        {showPhotos ? <div className="case-photos" key={selected.id}
          style={{ '--photo-count': selected.photos.length }}>
          {selected.photos.map(photo => <figure key={photo.file}>
            <img src={'/api/case-gallery/image/' + photo.file} alt={photo.label + ' · ' + active}
              width={photo.width} height={photo.height} decoding="async" />
            {['Before', 'After'].includes(photo.label) && <figcaption>{photo.label}</figcaption>}
          </figure>)}
        </div> : <div className="case-photo-gate">
          <p>These clinical photos may contain nudity.</p>
          <button className="case-reveal" type="button" onClick={() => setConsented(true)}>Show clinical photos</button>
        </div>}
        <button className="case-arrow case-previous" type="button" aria-label="Previous comparison" 
          disabled={matches.length < 2} onClick={() => step(-1)}>‹</button>
        <button className="case-arrow case-next" type="button" aria-label="Next comparison"
          disabled={matches.length < 2} onClick={() => step(1)}>›</button>
        <p className="case-position" aria-live="polite">Comparison {current + 1} of {matches.length}</p>
      </div>
      <p className="case-disclaimer">Results vary by patient.</p>
    </div>
  </section>;
}
