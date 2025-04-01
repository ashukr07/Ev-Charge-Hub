import express from 'express';

import { protectRoute, isAdmin, isManager } from '../middleware/auth.middleware.js';

import {createBooking, cancelBooking, getUserBookings, getManagerBookings, noShowBooking, completeBooking } from '../controllers/bookings.controller.js';

const router = express.Router();

router.post("/create",protectRoute, createBooking)

router.put("/cancel/:bookingId", protectRoute, cancelBooking);

router.get("/user", protectRoute, getUserBookings);

router.get("/all", protectRoute, isManager, getManagerBookings);

router.put("/noshow/:bookingId", protectRoute, isManager, noShowBooking);

router.put("/complete/:bookingId", protectRoute, isManager, completeBooking);


export default router;