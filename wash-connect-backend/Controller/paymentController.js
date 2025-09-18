const pool = require('../db');

exports.createPayment = async (req, res) => {
    const { appointmentId } = req.params;
    const { user_id, amount, method, receipt_url, status, partial } = req.body;

    if (!user_id || !amount || !method) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentAmount = partial ? amount / 2 : amount;

    try {
        // Record the payment
        await pool.query(
            'INSERT INTO payments (appointment_id, user_id, amount, method, receipt_url, status) VALUES (?, ?, ?, ?, ?, ?)',
            [appointmentId, user_id, paymentAmount, method, receipt_url || null, status || 'Pending']
        );

        // Update the paid_amount in bookings table
        await pool.query(
            'UPDATE bookings SET paid_amount = COALESCE(paid_amount, 0) + ? WHERE appointment_id = ?',
            [paymentAmount, appointmentId]
        );

        res.status(201).json({ success: true, message: 'Payment recorded.', paid_amount: paymentAmount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record payment', details: error.message });
    }
};

exports.updatePayment = async (req, res) => {
    const { appointmentId } = req.params;
    const { amount, status } = req.body;
    try {
        await pool.query(
            'UPDATE payments SET amount = ?, status = ? WHERE appointment_id = ?',
            [amount, status, appointmentId]
        );
        // Optionally update bookings.paid_amount here too
        await pool.query(
            'UPDATE bookings SET paid_amount = COALESCE(paid_amount, 0) + ? WHERE appointment_id = ?',
            [amount, appointmentId]
        );
        res.json({ success: true, message: 'Payment updated.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update payment', details: error.message });
    }
};