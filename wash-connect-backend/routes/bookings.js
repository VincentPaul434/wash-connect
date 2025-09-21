const express = require("express");
const router = express.Router();
const bookingCtrl = require("../Controller/bookingformController");

router.patch('/bookings/:appointment_id/status', bookingCtrl.updateBookingStatus);

module.exports = router;