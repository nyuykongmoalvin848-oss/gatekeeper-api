import { Router } from 'express';
import { createEvent, getEvents, getEventById, getEventBookings } from '../controllers/eventController.js';
import { createBooking, cancelBooking, getBookingById } from '../controllers/bookingController.js';

const router = Router();

router.post('/events', createEvent);
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.get('/events/:id/bookings', getEventBookings);

router.post('/events/:id/bookings', createBooking);
router.get('/bookings/:id', getBookingById);
router.post('/bookings/:id/cancel', cancelBooking);

export default router;
