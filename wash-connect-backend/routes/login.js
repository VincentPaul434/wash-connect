const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { identifier, password } = req.body; // 'identifier' can be email, user_id, or numberId

    try {
        if (!identifier || !password) {
            return res.status(400).json({ error: "Email/ID/Number ID and password are required." });
        }

        // Try to find user by email or user_id
        const [accounts] = await pool.query(
            `SELECT user_id AS id, first_name, last_name, email, password, status, role 
             FROM users 
             WHERE email = ? OR user_id = ?`,
            [identifier, identifier]
        );

        let account = accounts[0];
        let isAdmin = false;

        // If not found in users, try admins by numberId
        if (!account) {
            const [admins] = await pool.query(
                `SELECT adminId AS id, firstName AS first_name, lastName AS last_name, numberId AS email, password, 'active' AS status, 'admin' AS role
                 FROM admins
                 WHERE numberId = ?`,
                [identifier]
            );
            if (admins.length > 0) {
                account = admins[0];
                isAdmin = true;
            }
        }

        if (!account) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: account.id, email: account.email, role: account.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "7d" }
        );

        // Return user info including status
        res.json({
            message: "Login successful",
            token,
            user: {
                id: account.id,
                first_name: account.first_name,
                last_name: account.last_name,
                email: account.email,
                role: account.role,
                status: account.status
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

module.exports = router;