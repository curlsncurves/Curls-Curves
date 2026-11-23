import { test } from 'node:test';
import assert from 'node:assert/strict';
import routes from '../src/reference-routes.json' with { type: 'json' };
import catalog from '../src/catalog.json' with { type: 'json' };
import { answerClinicChat, chatPrompts } from '../src/clinic-chat-answers.js';

test('clinic prompts lead to established public website routes', () => {
  const prompts = [...chatPrompts, 'Dr Girish', 'nose job', 'before-and-after gallery',
    'operating hours', 'cancel my appointment', 'book FUE hair transplant'];
  for (const prompt of prompts) {
    const answer = answerClinicChat(prompt);
    assert.ok(answer.text && answer.links?.length, prompt);
    for (const { href } of answer.links) {
      if (!href.startsWith('/')) continue;
      const url = new URL(href, 'https://clinic.example');
      assert.ok(routes[url.pathname] || ['/contact', '/procedures'].includes(url.pathname) ||
        catalog.procedures.some(({ slug }) => '/procedure/' + slug === url.pathname), href);
      const topic = url.searchParams.get('procedure');
      if (topic) assert.ok(catalog.procedures.some(({ slug }) => slug === topic), href);
    }
  }
  assert.equal(answerClinicChat('nose job').links[0].href, '/rhinoplasty-surgery-in-bangalore');
});

test('follow-ups retain context and a named treatment takes precedence', () => {
  const { procedure } = answerClinicChat('What is FUE?');
  assert.equal(procedure, 'fue-hair-transplant');
  assert.equal(answerClinicChat('how much?', procedure).links[0].href, '/contact?procedure=fue-hair-transplant');
  assert.match(answerClinicChat('and recovery?', procedure).text, /scalp/i);
  assert.equal(answerClinicChat('book rhinoplasty', procedure).links[0].href, '/contact?procedure=rhinoplasty');
  assert.match(answerClinicChat('where is donor hair taken for FUE?').text, /follicular units/i);
});

test('personal, unknown and urgent questions route to appropriate help', () => {
  assert.match(answerClinicChat('am I suitable for a hair transplant?').text, /clinician/i);
  assert.match(answerClinicChat('open my account').text, /confirm/i);
  assert.ok(answerClinicChat('unexpected gibberish').links.some(({ href }) => href.startsWith('tel:')));
  const urgent = answerClinicChat('I have chest pain after liposuction');
  assert.match(urgent.text, /emergency services/);
  assert.equal(urgent.links, undefined);
});
