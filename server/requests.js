import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(process.env.DATA_DIR || 'data', 'consultations.sqlite');
if (!existsSync(file)) {
  console.log('No consultation database found in the configured data directory.');
} else {
  const database = new DatabaseSync(file, { readOnly: true });
  database.exec('PRAGMA busy_timeout = 5000');
  const email = database.prepare('PRAGMA table_info(consultations)').all().some(column => column.name === 'email') ? ', email' : '';
  const requests = database.prepare(
    `SELECT reference, name, phone, topic, created_at${email} FROM consultations ORDER BY created_at DESC LIMIT 100`
  ).all();
  if (requests.length) console.table(requests);
  else console.log('No consultation requests yet.');
  database.close();
}
