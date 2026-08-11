import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || 'tracker'}:${process.env.POSTGRES_PASSWORD || 'tracker'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'project_tracker'}`;

export const pool = new pg.Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
