const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a booking
router.post('/bookings', async (req, res) => {
    const {
        user_id,
        applicationId,
        service_name,
        schedule_date,
        address,
        message,
        personnelId
    } = req.body;

    // Check for existing active booking
    try {
        const [existing] = await pool.query(
            "SELECT * FROM bookings WHERE user_id = ? AND status NOT IN ('Declined', 'Done')",
            [user_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: "You already have an active booking." });
        }

        if (!user_id || !applicationId || !service_name || !schedule_date || !address) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await pool.query(
            `INSERT INTO bookings (user_id, applicationId, service_name, schedule_date, address, message, personnelId)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, applicationId, service_name, schedule_date, address, message || null, personnelId || null]
        );
        res.status(201).json({
            message: 'Booking submitted successfully',
            appointment_id: result.insertId,
            status: 'Pending'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit booking', details: error.message });
    }
});

// Get bookings by application
router.get('/bookings/by-application/:applicationId', async (req, res) => {
    const { applicationId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT b.*,
                    u.first_name AS customer_first_name,
                    u.last_name AS customer_last_name,
                    u.email AS customer_email
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.user_id
             WHERE b.applicationId = ?
             ORDER BY b.schedule_date DESC
             LIMIT 10`,
            [applicationId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
});

// Get bookings by customer
router.get('/bookings/customers/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT b.*,
                    u.first_name AS customer_first_name,
                    u.last_name AS customer_last_name,
                    u.email AS customer_email
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.user_id
             WHERE b.user_id = ?
             ORDER BY b.schedule_date DESC
             LIMIT 10`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
});

// Confirm a booking
router.patch('/bookings/confirm/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'Confirmed' WHERE appointment_id = ?",
            [appointmentId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm booking', details: error.message });
    }
});

// Get confirmed bookings by application
router.get('/bookings/confirmed/:applicationId', async (req, res) => {
    const { applicationId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT b.*,
                    u.first_name AS customer_first_name,
                    u.last_name AS customer_last_name,
                    u.email AS customer_email
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.user_id
             WHERE b.applicationId = ? AND b.status = 'Confirmed'
             ORDER BY b.schedule_date DESC`,
            [applicationId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch confirmed bookings', details: error.message });
    }
});

// Get booking with personnel details
router.get('/bookings/with-personnel/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT 
                b.*,
                u.first_name AS customer_first_name,
                u.last_name AS customer_last_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                p.personnelId,
                p.first_name AS personnel_first_name,
                p.last_name AS personnel_last_name,
                p.address AS personnel_address,
                p.email AS personnel_email,
                p.avatar AS personnel_avatar
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN personnel p ON b.personnelId = p.personnelId
            WHERE b.appointment_id = ?`,
            [appointmentId]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking', details: error.message });
    }
});

// Decline a booking
router.patch('/bookings/decline/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'Declined' WHERE appointment_id = ?",
            [appointmentId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to decline booking', details: error.message });
    }
});

// Update payment status and booking status
router.patch('/bookings/payment/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { status, payment_status } = req.body || {};

    if (!status || !payment_status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = ?, payment_status = ? WHERE appointment_id = ?",
            [status, payment_status, appointmentId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update payment status', details: error.message });
    }
});



router.post('/bookings/rate/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const { customer_name, rating, comment } = req.body;

  if (!rating || !customer_name) {
    return res.status(400).json({ error: 'Rating and customer name are required.' });
  }

  try {
    await pool.query(
      "INSERT INTO booking_reviews (appointment_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)",
      [appointmentId, customer_name, rating, comment]
    );
    res.json({ success: true, message: "Review submitted!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save review.", details: err.message });
  }
});



module.exports = router;