const pool = require('../db');

exports.updateBookingStatus = async (req, res) => {
  const appointmentId = req.params.appointmentId || req.body.appointmentId;
  const { new_status, reason } = req.body;
  // Add debug log:
  console.log("PATCH /bookings/status", { appointmentId, new_status, reason });

  if (!appointmentId || !new_status) {
    return res.status(400).json({ error: "appointmentId and new_status are required" });
  }

  try {
    const [oldRows] = await pool.query("SELECT status FROM bookings WHERE appointment_id = ?", [appointmentId]);
    if (!oldRows.length) return res.status(404).json({ error: "Booking not found" });
    const old_status = oldRows[0].status;

    await pool.query("UPDATE bookings SET status = ? WHERE appointment_id = ?", [new_status, appointmentId]);
    await pool.query(
      `INSERT INTO booking_status_history (appointment_id, old_status, new_status, changed_by, reason, changed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [appointmentId, old_status, new_status, "system", reason || ""]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("updateBookingStatus error:", err); // <--- See error details in your backend console
    res.status(500).json({ error: "Failed to update status" });
  }
};