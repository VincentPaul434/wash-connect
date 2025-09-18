const express = require('express');
const router = express.Router();
const paymentController = require('../Controller/paymentController');

router.post('/bookings/payment/:appointmentId', paymentController.createPayment);
router.patch('/bookings/payment/:appointmentId', paymentController.updatePayment);

module.exports = router;