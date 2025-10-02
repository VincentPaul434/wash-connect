const pool = require('../db');
const nodemailer = require('nodemailer');

// Helper to send email
async function sendResetEmail(email, resetLink) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'WashConnect Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
  });
}

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    // Check if user or carwash owner exists
    const [userRows] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    const [ownerRows] = await pool.query('SELECT owner_id FROM carwash_owners WHERE owner_email = ?', [email]);

    if (userRows.length === 0 && ownerRows.length === 0) {
      return res.status(404).json({ error: "Email not found." });
    }

    // Generate a reset token (simple example, use crypto for production)
    const token = Math.random().toString(36).substr(2) + Date.now();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token to password_requests table
    await pool.query(
      'INSERT INTO password_requests (email, token, expires, type, status) VALUES (?, ?, ?, ?, ?)',
      [
        email,
        token,
        expires,
        userRows.length ? 'user' : 'carwash_owner',
        'Pending'
      ]
    );

    // Send email with reset link
    const resetLink = `http://localhost:5173/password-reset?token=${token}`;
    await sendResetEmail(email, resetLink);

    res.json({ message: "Password reset request sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process request.", details: error.message });
  }
};