const express = require('express');
const router = express.Router();
const paymentController = require('../Controller/paymentController');

router.post('/bookings/payment/:appointmentId', paymentController.createPayment);
router.patch('/bookings/payment/:appointmentId', paymentController.updatePayment);
router.get('/payments/by-application/:applicationId', paymentController.getPaymentsByApplication);

module.exports = router;