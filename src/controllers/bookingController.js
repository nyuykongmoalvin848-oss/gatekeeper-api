import { pool } from '../config/db.js';
import { createBookingSchema } from '../schemas/schemas.js';

export const createBooking = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const eventId = parseInt(req.params.id);
    const parsed = createBookingSchema.parse(req.body);

    await client.query('BEGIN');

    
    const updateQuery = `
      UPDATE events 
      SET seats_remaining = seats_remaining - $1,
          status = CASE WHEN seats_remaining - $1 = 0 THEN 'sold_out'::varchar ELSE status END
      WHERE id = $2 AND seats_remaining >= $1 AND status = 'on_sale'
      RETURNING status
    `;
    const updateRes = await client.query(updateQuery, [parsed.quantity, eventId]);

    if (updateRes.rowCount === 0) {
      
      const statusCheck = await client.query('SELECT status, seats_remaining FROM events WHERE id = $1', [eventId]);
      await client.query('ROLLBACK');

      if (!statusCheck.rows.length) return res.status(404).json({ error: 'Event not found' });
      
      const evt = statusCheck.rows[0];
      if (evt.status === 'cancelled') return res.status(409).json({ error: 'Event is cancelled' });
      return res.status(409).json({ error: 'Not enough seats remaining or event sold out' });
    }

    
    const insertQuery = `
      INSERT INTO bookings (event_id, customer_id, quantity, status)
      VALUES ($1, $2, $3, 'confirmed') RETURNING *
    `;
    const insertRes = await client.query(insertQuery, [eventId, parsed.customer_id, parsed.quantity]);

    await client.query('COMMIT');
    
    res.setHeader('Location', `/bookings/${insertRes.rows[0].id}`);
    return res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Unknown customer or bad metadata references' });
    }
    next(err);
  } finally {
    client.release();
  }
};

export const cancelBooking = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const bookingId = parseInt(req.params.id);
    await client.query('BEGIN');

    
    const updateBookingQuery = `
      UPDATE bookings 
      SET status = 'cancelled' 
      WHERE id = $1 AND status = 'confirmed' 
      RETURNING event_id, quantity
    `;
    const bookingRes = await client.query(updateBookingQuery, [bookingId]);

    if (bookingRes.rowCount === 0) {
      const existCheck = await client.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
      await client.query('ROLLBACK');
      if (!existCheck.rows.length) return res.status(404).json({ error: 'Booking not found' });
      return res.status(409).json({ error: 'Booking already cancelled' });
    }

    const { event_id, quantity } = bookingRes.rows[0];

    
    await client.query(`
      UPDATE events 
      SET seats_remaining = seats_remaining + $1,
          status = 'on_sale'
      WHERE id = $2
    `, [quantity, event_id]);

    await client.query('COMMIT');
    return res.status(204).send();
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
