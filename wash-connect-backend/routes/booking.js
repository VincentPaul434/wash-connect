const express = require('express');
const router = express.Router();
const bookingformController = require('../Controller/bookingformController');
const bookingController = require('../Controller/bookingController');


// This route must be present!
router.patch('/bookings/:appointmentId/status', bookingController.updateBookingStatus);

// Optionally, also support body-based:
router.patch('/bookings/status', bookingController.updateBookingStatus);

// Add this route for GET booking by ID
router.get('/bookings/:appointmentId', bookingformController.getBookingById);

// Get latest status reason for an appointment
router.get('/bookings/reason/:appointmentId', bookingController.getLatestStatusReason);



module.exports = router;