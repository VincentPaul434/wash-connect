const pool = require('../db');

// Create a new refund request
exports.createRefundRequest = async (req, res) => {
  const { customer, amount, reason, bookingId,  ownerId } = req.body;
  if (!customer || !amount || !reason || !bookingId || !ownerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      `INSERT INTO refunds (customer, amount, reason, bookingId, ownerId, status, requestedAt)
       VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
      [customer, amount, reason, bookingId, ownerId]
    );
    res.status(201).json({ message: 'Refund request created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create refund request', details: err.message });
  }
};

// Get all refund requests (for owner)
exports.getRefundRequests = async (req, res) => {
  const { ownerId } = req.query;
  let query = 'SELECT * FROM refunds';
  let params = [];
  if (ownerId) {
    query += ' WHERE ownerId = ?';
    params.push(ownerId);
  }
  query += ' ORDER BY requestedAt DESC';
  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch refund requests', details: err.message });
  }
};

// Update refund request status
exports.updateRefundStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Update refund status
    await pool.query('UPDATE refunds SET status = ? WHERE id = ?', [status, id]);

    // If approved, update the booking's paid_amount to 0, payment_status to "Refunded", and status to "Cancelled"
    if (status === 'Approved') {
      // Get the refund request to find the bookingId
      const [[refund]] = await pool.query('SELECT bookingId FROM refunds WHERE id = ?', [id]);
      if (refund && refund.bookingId) {
        await pool.query(
          'UPDATE bookings SET paid_amount = 0, payment_status = "Refunded", status = "Cancelled" WHERE appointment_id = ?',
          [refund.bookingId]
        );
      }
    }

    res.json({ message: 'Refund status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update refund status', details: err.message });
  }
};

localStorage.setItem("owner", JSON.stringify({ owner_id: 4 }));