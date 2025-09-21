exports.updateBookingStatus = async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body; // e.g., 'In Progress' | 'Completed' | 'Cancelled'
  const allowed = new Set(['Pending','Confirmed','In Progress','Completed','Cancelled','Declined','Done']);
  if (!allowed.has(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const sql = `
      UPDATE bookings
      SET status = ?,
          started_at = CASE WHEN ? = 'In Progress' AND (started_at IS NULL OR started_at = '0000-00-00 00:00:00') THEN NOW() ELSE started_at END,
          completed_at = CASE WHEN ? IN ('Completed','Done') THEN NOW() ELSE completed_at END
      WHERE appointment_id = ?
    `;
    const [result] = await pool.query(sql, [status, status, status, appointment_id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Status updated', status });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update status', details: e.message });
  }
};