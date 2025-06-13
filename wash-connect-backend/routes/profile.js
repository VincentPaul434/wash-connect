const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const sql = 'SELECT id, first_name, last_name, email, phone, address, birth_date FROM users WHERE id = ?';
        const [users] = await pool.execute(sql, [req.user.userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile retrieved successfully',
            user: users[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Edit user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        birth_date
    } = req.body;

    try {
        if (!first_name && !last_name && !email && !phone && !address && !birth_date) {
            return res.status(400).json({ error: 'At least one field must be provided for update' });
        }

        if (email) {
            const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
            const [existingUsers] = await pool.execute(checkEmailSql, [email, req.user.userId]);

            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        const fieldsToUpdate = [];
        const values = [];

        if (first_name) {
            fieldsToUpdate.push('first_name = ?');
            values.push(first_name);
        }
        if (last_name) {
            fieldsToUpdate.push('last_name = ?');
            values.push(last_name);
        }
        if (email) {
            fieldsToUpdate.push('email = ?');
            values.push(email);
        }
        if (phone) {
            fieldsToUpdate.push('phone = ?');
            values.push(phone);
        }
        if (address) {
            fieldsToUpdate.push('address = ?');
            values.push(address);
        }
        if (birth_date) {
            fieldsToUpdate.push('birth_date = ?');
            values.push(birth_date);
        }

        values.push(req.user.userId);

        const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        const [result] = await pool.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const getUserSql = 'SELECT id, first_name, last_name, email, phone, address, birth_date FROM users WHERE id = ?';
        const [updatedUser] = await pool.execute(getUserSql, [req.user.userId]);

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser[0]
        });

    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Database error' });
        }
    }
});

module.exports = router;
