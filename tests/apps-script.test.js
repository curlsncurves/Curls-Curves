import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../integrations/consultations.gs', import.meta.url), 'utf8');
const fields = { name: '=Test', phone: '+91 00000 00000', email: 'test@example.invalid', topic: '3d-liposuction', consent: 'on' };

function mockScript({ failEmail = false, failSheet = false } = {}) {
  const rows = [];
  const alerts = [];
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: row => rows.push(row),
    getRange(row, column) {
      if (row === 'B:B') return { createTextFinder: () => ({ matchEntireCell: () => ({ findNext: () => ({ getRow: () => 2 }) }) }) };
      if (row === 1) return { getValues: () => [rows[0]] };
      return { setValue: value => { rows[row - 1][column - 1] = value; } };
    },
  };
  const doPost = runInNewContext(script + '\ndoPost;', {
    console: { error() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => ({ SPREADSHEET_ID: 'test', NOTIFICATION_EMAIL: 'staff@example.invalid' })[key] }) },
    Utilities: { getUuid: () => 'test-reference' },
    LockService: { getScriptLock: () => ({tryLock: () => true, releaseLock() {}}) },
    SpreadsheetApp: {
      openById() { if (failSheet) throw new Error('Sheet offline'); return { getSheetByName: () => sheet }; },
      flush() {},
    },
    MailApp: { sendEmail(...args) { if (failEmail) throw new Error('Quota'); alerts.push(args); } },
    HtmlService: { createHtmlOutput: html => ({ setTitle() { return this; }, addMetaTag: () => html }) },
  });
  return { submit: parameters => doPost({ parameter: parameters, contentLength: 200 }), rows, alerts };
}

test('Apps Script saves a literal sheet row and sends a reference-only alert', () => {
  const { submit, rows, alerts } = mockScript();
  assert.match(submit(fields), /Request received.*test-reference/);
  assert.equal(rows[1][2], "'=Test");
  assert.equal(rows[1][3], "'+91 00000 00000");
  assert.equal(rows[1][7], 'Sent');
  assert.equal(alerts.length, 1);
  assert.match(alerts[0][2], /test-reference/);
  assert.doesNotMatch(alerts[0][2], /example\.invalid|00000/);
});

test('invalid consent and failed sheet writes do not send alerts', () => {
  const { submit, alerts, rows } = mockScript({ failSheet: true });
  assert.match(submit({ ...fields, consent: '' }), /check your details/);
  assert.match(submit(fields), /could not be saved/);
  assert.equal(rows.length, 0);
  assert.equal(alerts.length, 0);
});

test('failed email leaves the saved request available to clinic staff', () => {
  const { submit, rows } = mockScript({ failEmail: true });
  assert.match(submit(fields), /Request received/);
  assert.equal(rows[1][7], 'Failed');
});
