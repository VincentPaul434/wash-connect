const pool = require('../db');

// Create a booking
exports.createBooking = async (req, res) => {
    const {
        user_id,
        applicationId,
        service_name,
        schedule_date,
        schedule_time,
        address,
        message,
        personnelId,
        price
    } = req.body;

    try {
        const [existing] = await pool.query(
            "SELECT * FROM bookings WHERE user_id = ? AND status NOT IN ('Declined', 'Done', 'Cancelled', 'Completed')",
            [user_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: "You have an active booking. Please complete and pay before booking again." });
        }
        if (!user_id || !applicationId || !service_name || !schedule_date || !schedule_time || !address || price === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await pool.query(
            `INSERT INTO bookings (user_id, applicationId, service_name, schedule_date, schedule_time, address, message, personnelId, price)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, applicationId, service_name, schedule_date, schedule_time, address, message || null, personnelId || null, price]
        );
        res.status(201).json({
            message: 'Booking submitted successfully',
            appointment_id: result.insertId,
            status: 'Pending'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit booking', details: error.message });
    }
};

// Get bookings by application
exports.getBookingsByApplication = async (req, res) => {
    const { applicationId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT b.*, u.email AS customer_email, u.first_name AS customer_first_name, u.last_name AS customer_last_name
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.user_id
             WHERE b.applicationId = ?`,
            [applicationId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings", details: error.message });
    }
};

// Get bookings by customer
// ...existing code...
// Get bookings by customer
// ...existing code...
// ...existing code...
exports.getBookingsByCustomer = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT b.*, 
                    u.first_name AS customer_first_name, 
                    u.last_name AS customer_last_name, 
                    u.email AS customer_email,
                    ca.carwashName AS carwash_name
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.user_id
             LEFT JOIN carwash_applications ca ON b.applicationId = ca.applicationId
             WHERE b.user_id = ?
             ORDER BY b.schedule_date DESC`, // <-- removed LIMIT 10
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
};
// ...existing code...
// ...existing code...
// ...existing code...

// Confirm a booking
exports.confirmBooking = async (req, res) => {
  const { appointmentId } = req.params; // <-- use appointmentId
  try {
    const [result] = await pool.query(
      "UPDATE bookings SET status = 'Confirmed' WHERE appointment_id = ?",
      [appointmentId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm booking" });
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
        // Get booking and personnel info
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
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const booking = rows[0];

        // Get all payments for this booking
        const [payments] = await pool.query(
            "SELECT * FROM payments WHERE appointment_id = ?",
            [appointmentId]
        );
        booking.payments = payments; // Add payments array to booking

        res.json(booking);
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
        res.json({ success: true, status: 'Declined' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to decline booking', details: error.message });
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
        res.json({ success: true, status: 'Cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
    }
};

// Check if booking is pending
exports.isBookingPending = async (req, res) => {
    const { appointmentId } = req.params;
    const [rows] = await pool.query(
        "SELECT status, service_name, schedule_date, schedule_time, address FROM bookings WHERE appointment_id = ?",
        [appointmentId]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
    }
    const isPending = rows[0].status === "Pending";
    res.json({
        pending: isPending,
        status: rows[0].status,
        service_name: rows[0].service_name,
        schedule_date: rows[0].schedule_date,
        schedule_time: rows[0].schedule_time, // <-- add this
        address: rows[0].address
    });
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM bookings WHERE appointment_id = ?", [appointmentId]);
    if (!rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

// Reschedule a booking (update date and time)
exports.rescheduleBooking = async (req, res) => {
    const { appointmentId } = req.params;
    const { schedule_date, schedule_time } = req.body;

    if (!schedule_date || !schedule_time) {
        return res.status(400).json({ error: "New date and time are required." });
    }

    try {
        // Update booking date and time
        const [result] = await pool.query(
            "UPDATE bookings SET schedule_date = ?, schedule_time = ? WHERE appointment_id = ?",
            [schedule_date, schedule_time, appointmentId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found." });
        }
        res.json({ success: true, message: "Booking rescheduled." });
    } catch (error) {
        res.status(500).json({ error: "Failed to reschedule booking", details: error.message });
    }
};


