const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.put('/change-password', authenticateToken, async (req, res) => {
    const { current_password, new_password } = req.body;

    try {
        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const getUserSql = 'SELECT password FROM users WHERE id = ?';
        const [users] = await pool.execute(getUserSql, [req.user.userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
        const [result] = await pool.execute(updateSql, [hashedNewPassword, req.user.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Password changed successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
