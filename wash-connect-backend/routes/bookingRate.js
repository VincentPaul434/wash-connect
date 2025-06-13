const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/bookings/rate/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const { customer_name, rating, comment } = req.body;

  // Validate appointmentId is a positive integer
  const appointmentIdNum = Number(appointmentId);
  if (!Number.isInteger(appointmentIdNum) || appointmentIdNum <= 0) {
    return res.status(400).json({ error: 'Invalid appointment ID.' });
  }

  // Validate required fields
  if (!rating || !customer_name) {
    return res.status(400).json({ error: 'Rating and customer name are required.' });
  }

  // Validate rating is a number (optional: check range)
  const ratingNum = Number(rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  try {
    await pool.query(
      "INSERT INTO booking_reviews (appointment_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)",
      [appointmentIdNum, customer_name, ratingNum, comment]
    );
    res.json({ success: true, message: "Review submitted!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save review.", details: err.message });
  }
});

module.exports = router;