import { createHash, randomUUID } from 'node:crypto';
import catalog from '../src/catalog.json' with { type: 'json' };
import referenceRoutes from '../src/reference-routes.json' with { type: 'json' };

const topics = new Set(['general', ...catalog.procedures.map(({ slug }) => slug),
  ...Object.keys(referenceRoutes).filter(path => path.includes('-in-bangalore') || path.startsWith('/service-'))]);

export async function submitConsultation(body, store, now = Date.now()) {
  const { name, phone, email = '', topic, consent } = body ?? {};
  const fullName = typeof name === 'string' ? name.trim() : '';
  const number = typeof phone === 'string' && phone.length <= 32 ? phone.trim().replace(/[\s()-]/g, '') : '';
  const emailAddress = typeof email === 'string' && email.length <= 254 ? email.trim() : null;
  if (emailAddress === null || (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))) {
    return { status: 400, body: { message: 'Check your email address.' } };
  }
  if (fullName.length < 2 || fullName.length > 80 || !/^[\p{L}\p{M} .’'-]+$/u.test(fullName) ||
      !/^\+?[0-9]{8,15}$/.test(number) || !topics.has(topic) || consent !== true) {
    return { status: 400, body: { message: 'Check your name, phone number, procedure and contact consent.' } };
  }
  const windowMs = 15 * 60 * 1000;
  const expires = (Math.floor(now / windowMs) + 1) * windowMs;
  const key = createHash('sha256').update(`${expires}:${number.replace(/^\+/, '')}`).digest('hex');
  const reference = randomUUID();
  const saved = await store({ reference, name: fullName, phone: number, topic, email: emailAddress, now, expires, key });
  if (!saved) {
    return {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((expires - now) / 1000)) },
      body: { message: 'Please wait before submitting again, or call the clinic.' },
    };
  }
  return { status: 201, body: { reference } };
}
