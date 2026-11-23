import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createHostedApi } from '../server/hosted-api.js';
import { postgresStore } from '../server/postgres-consultations.js';

const origin = 'https://clinic.example';
function request(path, raw, headers = {}) {
  return new Request(origin + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
    body: typeof raw === 'string' ? raw : JSON.stringify(raw),
  });
}

test('Vercel handler validates and durably writes requests using PostgreSQL', async () => {
  const db = await PGlite.create();
  try {
    await db.exec(await readFile(new URL('../db/001-consultations.sql', import.meta.url), 'utf8'));
    const api = createHostedApi(postgresStore(async (sql, params) => (await db.query(sql, params)).rows));
    const payload = { name: 'Test Patient', phone: '+91 90000 12345', email: 'patient@example.test', topic: 'fue-hair-transplant', consent: true };
    assert.equal((await api.fetch(request('/api/consultations', { ...payload, consent: false }))).status, 400);
    assert.equal((await api.fetch(request('/api/consultations', payload, { Origin: 'https://other.example' }))).status, 403);
    assert.equal((await api.fetch(request('/api/consultations', '{'))).status, 400);
    assert.equal((await api.fetch(request('/api/consultations', ' '.repeat(4097)))).status, 413);

    const responses = await Promise.all(Array.from({ length: 7 }, (_, index) =>
      api.fetch(request('/api/index?endpoint=consultations', {
        ...payload, phone: index % 2 ? payload.phone : payload.phone.slice(1),
      }))));
    assert.equal(responses.filter(res => res.status === 201).length, 5);
    assert.equal(responses.filter(res => res.status === 429 && res.headers.has('Retry-After')).length, 2);
    const saved = (await db.query('SELECT reference, topic, email FROM consultations')).rows;
    assert.equal(saved.length, 5);
    for (const row of saved) {
      assert.equal(row.topic, payload.topic);
      assert.equal(row.email, payload.email);
    }
    assert.equal(new Set(saved.map(({ reference }) => reference)).size, 5);
    assert.equal((await api.fetch(new Request(origin + '/api/index?endpoint=unavailable'))).status, 404);
  } finally {
    await db.close();
  }
});

test('unconfigured hosted storage fails closed', async () => {
  const api = createHostedApi(null);
  assert.equal((await api.fetch(request('/api/consultations', {}))).status, 503);
  const health = await api.fetch(new Request(origin + '/api/index?endpoint=health'));
  assert.deepEqual(await health.json(), { status: 'ok', consultationsConfigured: false });
  assert.equal(health.headers.get('Cache-Control'), 'no-store');
});
