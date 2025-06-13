const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { identifier, password } = req.body; // 'identifier' can be email or numberId

    try {
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Identifier and password are required' });
        }


        let sql = 'SELECT user_id AS id, first_name, last_name, email, password, "user" AS role FROM users WHERE email = ?';
        let [accounts] = await pool.execute(sql, [identifier]);

    
        if (accounts.length === 0) {
            sql = 'SELECT adminId AS id, firstName AS first_name, lastName AS last_name, numberId AS email, password, "admin" AS role FROM admins WHERE numberId = ?';
            [accounts] = await pool.execute(sql, [identifier]);
        }

        if (accounts.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const account = accounts[0];

        const isPasswordValid = await bcrypt.compare(password, account.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: account.id,
                email: account.email,
                role: account.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: account.id,
                first_name: account.first_name,
                last_name: account.last_name,
                email: account.email,
                role: account.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
