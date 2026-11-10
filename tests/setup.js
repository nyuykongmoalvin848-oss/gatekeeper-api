import dotenv from 'dotenv';
import { before } from 'node:test';
import { pool } from '../config/db.js';

dotenv.config({ path: '.env.test', override: true });

before(async () => {
  const res = await pool.query('SELECT current_database();');
  const currentDb = res.rows[0].current_database;

  if (!currentDb.endsWith('_test')) {
    throw new Error(
      `🛑 CRITICAL SAFETY ABORT: Tests must run on a database ending in '_test'. Current DB: ${currentDb}`
    );
  }

  await pool.query('DELETE FROM bookings; DELETE FROM customers; DELETE FROM events;');
});
