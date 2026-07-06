import express from 'express';
import * as ctrl from '../controllers/sports.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public read routes
router.get('/all', ctrl.getAvailableCourts);
router.get('/facility/:id', ctrl.getCourtDetails);

// Private routes (require a valid session)
router.get('/my-facilities', requireAuth, ctrl.getMyFacilities);
router.post('/create', requireAuth, ctrl.createNewCourt);
router.put('/update/:id', requireAuth, ctrl.updateCourt);
router.delete('/delete/:id', requireAuth, ctrl.deleteCourt);
router.post('/book', requireAuth, ctrl.createBooking);
router.get('/my-bookings', requireAuth, ctrl.getMyBookings);
router.patch('/cancel/:id', requireAuth, ctrl.cancelBooking);

export default router;
