const express = require("express");
const router = express.Router();
const bookingCtrl = require("../Controller/bookingformController");

router.patch("/bookings/confirm/:appointment_id", bookingCtrl.confirmBooking);

module.exports = router;