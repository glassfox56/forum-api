/* istanbul ignore file */
import { Pool } from 'pg';
import config from '../../../Commons/config.js';

const poolConfig = { ...config.database };

// Support SSL for providers that require it (Neon, some managed Postgres)
// - Honor explicit env `PGSSLMODE=require`
// - Or auto-enable when PGHOST looks like a Neon pooler host
if (
  process.env.PGSSLMODE === 'require' ||
  (process.env.PGHOST && process.env.PGHOST.includes('pooler'))
) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

export default pool;
