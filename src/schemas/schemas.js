import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(1).max(150),
  venue: z.string().min(1).max(150),
  starts_at: z.string().datetime(),
  capacity: z.number().int().nonnegative(),
});

export const createBookingSchema = z.object({
  customer_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
});

export const paginationSchema = z.object({
  after: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('20'),
});
