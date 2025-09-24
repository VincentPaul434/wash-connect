const pool = require('../db');

// Helper: get current total paid for an appointment (optional)
async function getTotalPaid(appointmentId) {
  const [rows] = await pool.query(
    'SELECT COALESCE(SUM(amount),0) AS total_paid FROM payments WHERE appointment_id = ?',
    [appointmentId]
  );
  return rows[0]?.total_paid || 0;
}

exports.createPayment = async (req, res) => {
  const { appointmentId } = req.params;
  let { user_id, amount, method, receipt_url, payment_status } = req.body;

  if (!user_id || !amount || !method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  amount = parseFloat(amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  try {
    // OPTIONAL: derive payment_status based on total so far (remove if you always pass it from frontend)
    if (!payment_status) {
      const beforeTotal = await getTotalPaid(appointmentId);
      const afterTotal = beforeTotal + amount;
      // You can define your own rule; leaving as Partial unless frontend sends Paid
      payment_status = 'Partial';
      // Example: if frontend also sends expected total target, you could compare there.
    }

    await pool.query(
      'INSERT INTO payments (appointment_id, user_id, amount, method, receipt_url, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [appointmentId, user_id, amount, method, receipt_url || null, payment_status]
    );

    res.status(201).json({ success: true, message: 'Payment recorded.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record payment', details: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  const { appointmentId } = req.params;
  let { user_id, amount, method, receipt_url, payment_status } = req.body;

  if (!user_id || !amount || !method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  amount = parseFloat(amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  try {
    if (!payment_status) {
      const beforeTotal = await getTotalPaid(appointmentId);
      const afterTotal = beforeTotal + amount;
      payment_status = 'Partial'; // or decide logic differently
    }

    // Treat PATCH as “add another payment”
    await pool.query(
      'INSERT INTO payments (appointment_id, user_id, amount, method, receipt_url, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [appointmentId, user_id, amount, method, receipt_url || null, payment_status]
    );

    res.json({ success: true, message: 'Additional payment recorded.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment', details: error.message });
  }
};

// GET: All payments for a given carwash application (shop)
// Joins payments -> bookings (by appointment_id) and users (by user_id)
exports.getPaymentsByApplication = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({ error: 'applicationId is required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
          p.payment_id,
          p.appointment_id,
          p.user_id,
          p.amount,
          p.method,
          p.receipt_url,
          p.payment_status,
          p.created_at,
          b.applicationId,
          b.service_name,
          b.schedule_date,
          b.price AS booking_price,
          b.status AS booking_status,
          u.first_name AS customer_first_name,
          u.last_name AS customer_last_name,
          u.email AS customer_email
        FROM payments p
        JOIN bookings b ON p.appointment_id = b.appointment_id
        LEFT JOIN users u ON p.user_id = u.user_id
       WHERE b.applicationId = ?
       ORDER BY p.appointment_id DESC`,
      [applicationId]
    );

    // Also compute quick totals per application for convenience
    const [totals] = await pool.query(
      `SELECT 
          COALESCE(SUM(p.amount),0) AS total_amount,
          SUM(CASE WHEN p.payment_status = 'Refunded' THEN p.amount ELSE 0 END) AS total_refunded,
          SUM(CASE WHEN p.payment_status IN ('Paid','Completed') THEN p.amount ELSE 0 END) AS total_paid
       FROM payments p
       JOIN bookings b ON p.appointment_id = b.appointment_id
      WHERE b.applicationId = ?`,
      [applicationId]
    );

    res.json({ payments: rows, summary: totals?.[0] || { total_amount: 0, total_refunded: 0, total_paid: 0 } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
};

// GET /api/payments/by-appointment/:appointmentId
exports.getPaymentByAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM payments WHERE appointment_id = ?", [appointmentId]);
    res.json({ payment: rows }); // returns all payments for that appointment
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};