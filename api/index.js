import { neon } from '@neondatabase/serverless';
import { createHostedApi } from '../server/hosted-api.js';
import { postgresStore } from '../server/postgres-consultations.js';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export default createHostedApi(sql ? postgresStore((query, values) => sql.query(query, values)) : null);
