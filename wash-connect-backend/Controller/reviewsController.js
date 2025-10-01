const pool = require('../db');

exports.getReviewsByApplication = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT bf.rating, bf.comment, bf.customer_name
       FROM booking_feedbacks bf
       JOIN bookings b ON bf.appointment_id = b.appointment_id
       WHERE b.applicationId = ?`,
      [applicationId]
    );
    const ratings = rows.map(r => Number(r.rating)).filter(r => !isNaN(r));
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;
    res.json({
      feedbacks: rows,
      avgRating
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews.", details: err.message });
  }
};