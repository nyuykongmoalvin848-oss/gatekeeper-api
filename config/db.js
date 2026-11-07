import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.NODE_ENV === 'test' 
  ? process.env.DATABASE_URL_TEST 
  : process.env.DATABASE_URL;

export const pool = new pg.Pool({
  connectionString,
});
