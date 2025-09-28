const express = require('express');
const router = express.Router();
const paymentController = require('../Controller/paymentController');

router.post('/bookings/payment/:appointmentId', paymentController.createPayment);
router.patch('/bookings/payment/:appointmentId', paymentController.updatePayment);
router.get('/payments/by-application/:applicationId', paymentController.getPaymentsByApplication);
router.get('/payments/by-appointment/:appointmentId', paymentController.getPaymentByAppointment);
router.get('/user/:userId', paymentController.getPaymentsByUser);

module.exports = router;