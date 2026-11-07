DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  venue VARCHAR(150) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  seats_remaining INTEGER NOT NULL CHECK (seats_remaining >= 0),
  status VARCHAR(12) NOT NULL DEFAULT 'on_sale' CHECK (status IN ('on_sale','sold_out','cancelled'))
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 10),
  status VARCHAR(12) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_starts_at_id ON events(starts_at, id);
CREATE INDEX idx_bookings_event_id_id ON bookings(event_id, id);
