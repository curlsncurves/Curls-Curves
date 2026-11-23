import catalog from './catalog.json' with { type: 'json' };
import routes from './reference-routes.json' with { type: 'json' };
import { educationFor } from './procedure-education.js';

const phone = { label: 'Call +91 94802 81652', href: 'tel:+919480281652' };
const whatsapp = { label: 'WhatsApp the clinic', href: 'https://wa.me/919480281652' };
const booking = { label: 'Request a consultation', href: '/contact' };
const directory = { label: 'Browse procedures', href: '/procedures' };
const maps = { label: 'Open directions', href: 'https://www.google.com/maps/search/?api=1&query=Curls+and+Curves+Vijayanagar+Bengaluru' };

export const chatPrompts = ['Book a consultation', 'Explore procedures', 'Clinic address', 'Talk to the clinic'];

const names = new Map(catalog.procedures.map(item => [item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(), item]));
const aliases = {
  'nose job': 'rhinoplasty', 'nose reshaping': 'rhinoplasty', 'hair transplant': 'hair-transplantation',
  'hair restoration': 'hair-transplantation', 'fue': 'fue-hair-transplant', 'boob job': 'breast-augmentation',
  'eyelid surgery': 'blepharoplasty', 'bbl': 'buttock-fat-grafting', 'thigh lift': 'thighplasty',
  'nose surgery': 'rhinoplasty', 'double eyelid': 'blepharoplasty',
};
for (const [name, slug] of Object.entries(aliases)) {
  const item = catalog.procedures.find(entry => entry.slug === slug);
  if (item && !names.has(name)) names.set(name, item);
}
const phrases = [...names].sort(([left], [right]) => right.length - left.length);

const preferredRoutes = {
  rhinoplasty: '/rhinoplasty-surgery-in-bangalore',
  'revision-rhinoplasty': '/revision-rhinoplasty-surgery-in-bangalore',
  'fue-hair-transplant': '/procedure/fue-hair-transplant-in-bangalore',
  'deep-plane-facelift-facial-rejuvenation': '/deep-plane-facelift-in-bangalore',
};
function procedurePage(slug) {
  return [preferredRoutes[slug], '/procedure/' + slug + '-in-bangalore', '/' + slug + '-in-bangalore']
    .find(path => path && routes[path]) || '/procedure/' + slug;
}

export function answerClinicChat(message, previousProcedure) {
  let topic;
  const result = respond();
  return { ...result, ...(topic ? { procedure: topic.slug } : {}) };

  function respond() {
    const query = message.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const padded = ' ' + query + ' ';
    const matched = phrases.find(([name]) => padded.includes(' ' + name + ' '))?.[1];
    const followUp = /^(?:(?:and|what about|how about)\s+)?(?:how much|cost|price|recovery|downtime|risks?|side effects|book|appointment)\b/.test(query);
    const found = matched || (followUp ? catalog.procedures.find(item => item.slug === previousProcedure) : undefined);
    topic = found;
    const procedureLink = found && { label: found.title, href: procedurePage(found.slug) };
    const consultation = found ? { ...booking, href: '/contact?procedure=' + found.slug } : booking;

    if (/\b(?:cannot breathe|can t breathe|difficulty breathing|chest pain|heavy bleeding|uncontrolled bleeding|medical emergency)\b/.test(query)) {
      return { text: 'If you are experiencing these symptoms now, seek urgent medical help. For a possible emergency, contact your local emergency services. The website chat is unmonitored.' };
    }
    if (/\b(?:address|location|directions|parking|map)\b/.test(query) || /\bwhere (?:are you|is the clinic|is curls|are you located)\b/.test(query)) {
      return { text: 'Curls & Curves is at #15, 8th Cross Road, MC Layout, Vijayanagar, Bengaluru 560040.', links: [maps, phone] };
    }
    if (/\b(?:open|closed|hours|timing|timings|weekends|sunday|availability|available|today|tomorrow)\b/.test(query)) {
      return { text: 'Please confirm opening hours or appointment availability with the clinic directly.', links: [phone, whatsapp] };
    }
    if (/\b(?:how much|price|pricing|cost|costs|charge|charges|fee|fees|package|insurance)\b/.test(query)) {
      return { text: found ? 'Please ask the clinic for an estimate for ' + found.title + ' after discussing your needs.' : 'Please ask the clinic for the current consultation fee or a procedure estimate.', links: [consultation, whatsapp] };
    }
    if (/\b(?:book|booking|appointment|consultation|schedule|callback)\b/.test(query) && !/\b(?:cancel|reschedule)\b/.test(query)) {
      return { text: 'Use the consultation form to request a callback. The clinic can confirm an appointment time.', links: [consultation, whatsapp] };
    }
    if (/\b(?:contact|phone|call|number|whatsapp|human|staff|talk|email|cancel|reschedule)\b/.test(query)) {
      return { text: 'You can contact the clinic by phone or WhatsApp.', links: [phone, whatsapp] };
    }
    if (/\b(?:doctor|surgeon|girish)\b/.test(query)) {
      return { text: 'Dr. Girish A C leads the Curls & Curves clinic. You can read his profile or request a consultation.', links: [{ label: 'View doctor profile', href: '/about-doctor.php' }, consultation] };
    }
    if (/\bbefore (?:and )?after\b|\b(?:gallery|photos|results)\b/.test(query) && !/\b(?:my|symptom|pain)\b/.test(query)) {
      return { text: 'The Before & After page has a results gallery. Individual results vary.', links: [{ label: 'View Before & After', href: '/before-after.php' }] };
    }
    if (found) {
      const entry = educationFor(found.slug);
      const key = /\b(?:risk|risks|complications|side effects)\b/.test(query) ? 'risks' :
        /\b(?:recovery|heal|healing|downtime)\b/.test(query) ? 'recovery' : 'overview';
      const personal = /\b(?:should i|can i|am i|safe for me|my symptoms|diagnos\w*|medication)\b/.test(query);
      return { text: personal ? 'A clinician can assess what is appropriate for you. Use the procedure page for general information.' :
        entry?.[key] || 'Open the ' + found.title + ' page for general information and questions to discuss with the clinic.', links: [procedureLink, consultation] };
    }
    if (/\b(?:procedure|procedures|treatments|services|explore)\b/.test(query)) {
      return { text: 'Browse the procedure directory, or type a name such as Rhinoplasty, FUE Hair Transplant, or Liposuction.', links: [directory] };
    }
    return { text: 'I can help you find a procedure, the clinic address, or consultation options. For personal medical questions or anything I haven’t covered, contact the clinic directly.', links: [directory, phone] };
  }
}
