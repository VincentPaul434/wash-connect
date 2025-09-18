const express = require('express');
const router = express.Router();
const bookingformController = require('../Controller/bookingformController');

router.post('/bookings', bookingformController.createBooking);
router.get('/bookings/by-application/:applicationId', bookingformController.getBookingsByApplication);
router.get('/bookings/customers/:userId', bookingformController.getBookingsByCustomer);
router.patch('/bookings/confirm/:appointmentId', bookingformController.confirmBooking);
router.get('/bookings/confirmed/:applicationId', bookingformController.getConfirmedBookingsByApplication);
router.get('/bookings/with-personnel/:appointmentId', bookingformController.getBookingWithPersonnel);
router.patch('/bookings/decline/:appointmentId', bookingformController.declineBooking);
router.patch('/bookings/payment/:appointmentId', bookingformController.updatePaymentStatus);
router.post('/bookings/payment/:appointmentId', bookingformController.recordPayment);
router.patch('/bookings/cancel/:appointmentId', bookingformController.cancelBooking);

module.exports = router;