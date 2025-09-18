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