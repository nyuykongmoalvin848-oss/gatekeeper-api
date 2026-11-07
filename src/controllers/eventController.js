import { pool } from '../config/db.js';
import { createEventSchema, paginationSchema } from '../schemas/schemas.js';

export const createEvent = async (req, res, next) => {
  try {
    const parsed = createEventSchema.parse(req.body);
    const query = `
      INSERT INTO events (name, venue, starts_at, capacity, seats_remaining)
      VALUES ($1, $2, $3, $4, $4) RETURNING *
    `;
    const values = [parsed.name, parsed.venue, parsed.starts_at, parsed.capacity];
    const { rows } = await pool.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { after, limit } = paginationSchema.parse(req.query);
    let query = `SELECT * FROM events`;
    const values = [];

    if (after) {
      const [afterTime, afterId] = Buffer.from(after, 'base64').toString('ascii').split('_');
      query += ` WHERE (starts_at, id) > ($1, $2) ORDER BY starts_at ASC, id ASC LIMIT $3`;
      values.push(afterTime, parseInt(afterId), limit);
    } else {
      query += ` ORDER BY starts_at ASC, id ASC LIMIT $1`;
      values.push(limit);
    }

    const { rows } = await pool.query(query, values);
    
    let nextCursor = null;
    if (rows.length === limit) {
      const lastItem = rows[rows.length - 1];
      nextCursor = Buffer.from(`${lastItem.starts_at.toISOString()}_${lastItem.id}`).toString('base64');
    }

    return res.json({ data: rows, next_cursor: nextCursor });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const getEventBookings = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid ID format' });

    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (!eventCheck.rows.length) return res.status(404).json({ error: 'Event not found' });

    const { after, limit } = paginationSchema.parse(req.query);
    let query = `SELECT * FROM bookings WHERE event_id = $1`;
    const values = [eventId];

    if (after) {
      const [afterDate, afterId] = Buffer.from(after, 'base64').toString('ascii').split('_');
      query += ` AND (booked_at, id) > ($2, $3) ORDER BY booked_at ASC, id ASC LIMIT $4`;
      values.push(afterDate, parseInt(afterId), limit);
    } else {
      query += ` ORDER BY booked_at ASC, id ASC LIMIT $2`;
      values.push(limit);
    }

    const { rows } = await pool.query(query, values);

    let nextCursor = null;
    if (rows.length === limit) {
      const lastItem = rows[rows.length - 1];
      nextCursor = Buffer.from(`${lastItem.booked_at.toISOString()}_${lastItem.id}`).toString('base64');
    }

    return res.json({ data: rows, next_cursor: nextCursor });
  } catch (err) {
    next(err);
  }
};
