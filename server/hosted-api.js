import { submitConsultation } from './consultations.js';

const noStore = { 'Cache-Control': 'no-store' };
function json(status, body, headers = {}) {
  return Response.json(body, { status, headers: { ...noStore, ...headers } });
}

const maxBody = 4096;
async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError('Missing body');
  let size = 0;
  let text = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBody) {
        await reader.cancel();
        throw new RangeError('Body too large');
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

export function createHostedApi(store) {
  return {
    async fetch(request) {
      const url = new URL(request.url);
      const endpoint = url.pathname === '/api/index' ? url.searchParams.get('endpoint') : url.pathname.split('/').at(-1);
      if (endpoint === 'health') {
        return request.method === 'GET' ? json(200, { status: 'ok', consultationsConfigured: Boolean(store) })
          : json(405, { message: 'Method not allowed.' }, { Allow: 'GET' });
      }
      if (endpoint !== 'consultations') return json(404, { message: 'Endpoint unavailable.' });
      if (request.method !== 'POST') return json(405, { message: 'Method not allowed.' }, { Allow: 'POST' });
      if (request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
          (request.headers.has('Origin') && request.headers.get('Origin') !== url.origin)) {
        return json(403, { message: 'Submit the form from the clinic website.' });
      }
      if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        return json(415, { message: 'Expected a JSON request.' });
      }
      if (!store) return json(503, { message: 'Online requests are temporarily unavailable. Please call the clinic.' });
      let payload;
      try {
        payload = await readBody(request);
      } catch (error) {
        return json(error instanceof RangeError ? 413 : 400, { message: 'Invalid request.' });
      }
      try {
        const result = await submitConsultation(payload, store);
        return json(result.status, result.body, result.headers);
      } catch {
        return json(503, { message: 'Unable to save your request. Please call the clinic or try again later.' });
      }
    }
  };
}

