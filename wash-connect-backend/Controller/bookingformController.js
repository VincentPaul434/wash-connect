
const pool = require('../db');

// Create a booking
exports.createBooking = async (req, res) => {
	const {
		user_id,
		applicationId,
		service_name,
		schedule_date,
		address,
		message,
		personnelId,
		price
	} = req.body;

	try {
		const [existing] = await pool.query(
			"SELECT * FROM bookings WHERE user_id = ? AND status NOT IN ('Declined', 'Done', 'Cancelled')",
			[user_id]
		);
		if (existing.length > 0) {
			return res.status(400).json({ error: "You already have an active booking." });
		}
		if (!user_id || !applicationId || !service_name || !schedule_date || !address || price === undefined) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		const [result] = await pool.query(
			`INSERT INTO bookings (user_id, applicationId, service_name, schedule_date, address, message, personnelId, price)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[user_id, applicationId, service_name, schedule_date, address, message || null, personnelId || null, price]
		);
		res.status(201).json({
			message: 'Booking submitted successfully',
			appointment_id: result.insertId,
			status: 'Pending'
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to submit booking', details: error.message });
	}
};

// Get bookings by application
exports.getBookingsByApplication = async (req, res) => {
	const { applicationId } = req.params;
	try {
		const [rows] = await pool.query(
			`SELECT b.*, u.first_name AS customer_first_name, u.last_name AS customer_last_name, u.email AS customer_email
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
};

// Get bookings by customer
exports.getBookingsByCustomer = async (req, res) => {
	const { userId } = req.params;
	try {
		const [rows] = await pool.query(
			`SELECT b.*, u.first_name AS customer_first_name, u.last_name AS customer_last_name, u.email AS customer_email
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
};

// Confirm a booking
exports.confirmBooking = async (req, res) => {
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
};

// Get confirmed bookings by application
exports.getConfirmedBookingsByApplication = async (req, res) => {
	const { applicationId } = req.params;
	try {
		const [rows] = await pool.query(
			`SELECT b.*, u.first_name AS customer_first_name, u.last_name AS customer_last_name, u.email AS customer_email
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
};

// Get booking with personnel details
exports.getBookingWithPersonnel = async (req, res) => {
	const { appointmentId } = req.params;
	try {
		const [rows] = await pool.query(
			`SELECT b.*, u.first_name AS customer_first_name, u.last_name AS customer_last_name, u.email AS customer_email, u.phone AS customer_phone,
				p.personnelId, p.first_name AS personnel_first_name, p.last_name AS personnel_last_name, p.address AS personnel_address, p.email AS personnel_email, p.avatar AS personnel_avatar,
				COALESCE(SUM(pay.amount), 0) AS amount_paid
			 FROM bookings b
			 LEFT JOIN users u ON b.user_id = u.user_id
			 LEFT JOIN personnel p ON b.personnelId = p.personnelId
			 LEFT JOIN payments pay ON b.appointment_id = pay.appointment_id
			 WHERE b.appointment_id = ?
			 GROUP BY b.appointment_id`,
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
};

// Decline a booking
exports.declineBooking = async (req, res) => {
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
};

// Update payment status and booking status
exports.updatePaymentStatus = async (req, res) => {
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
};

// Record a payment
exports.recordPayment = async (req, res) => {
	const { appointmentId } = req.params;
	const { amount, method, receipt_url, status } = req.body;
	if (!amount || !method) {
		return res.status(400).json({ error: 'Missing required fields' });
	}
	try {
		await pool.query(
			`INSERT INTO payments (appointment_id, amount, method, receipt_url, status)
			 VALUES (?, ?, ?, ?, ?)`,
			[appointmentId, amount, method, receipt_url || null, status || 'Pending']
		);
		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ error: 'Failed to record payment', details: error.message });
	}
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
	const { appointmentId } = req.params;
	try {
		const [result] = await pool.query(
			"UPDATE bookings SET status = 'Cancelled' WHERE appointment_id = ?",
			[appointmentId]
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Booking not found' });
		}
		res.json({ success: true, message: 'Booking cancelled.' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
	}
};
