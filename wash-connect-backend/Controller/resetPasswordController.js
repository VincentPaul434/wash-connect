const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password are required." });

  try {
    // Find the password request
    const [rows] = await pool.query('SELECT * FROM password_requests WHERE token = ? AND status = "Pending"', [token]);
    if (rows.length === 0) return res.status(400).json({ error: "Invalid or expired token." });

    const request = rows[0];
    if (new Date() > new Date(request.expires)) {
      return res.status(400).json({ error: "Token has expired." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in the correct table
    if (request.type === 'user') {
      await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, request.email]);
    } else {
      await pool.query('UPDATE carwash_owners SET owner_password = ? WHERE owner_email = ?', [hashedPassword, request.email]);
    }

    // Mark token as used
    await pool.query('UPDATE password_requests SET status = "Used" WHERE id = ?', [request.id]);

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password.", details: error.message });
  }
};