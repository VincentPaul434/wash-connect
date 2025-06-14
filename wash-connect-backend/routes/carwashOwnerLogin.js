const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.post('/login-carwash-owner', async (req, res) => {
    const { ownerEmail, ownerPassword } = req.body;

    try {
        if (!ownerEmail || !ownerPassword) {
            return res.status(400).json({
                error: 'Missing credentials',
                details: !ownerEmail ? 'Email is required' : 'Password is required'
            });
        }

        const [owners] = await pool.execute(
            'SELECT owner_id, owner_email, owner_password, owner_first_name, owner_last_name FROM carwash_owners WHERE owner_email = ?',
            [ownerEmail]
        );

        if (owners.length === 0) {
            return res.status(401).json({
                error: 'Login failed',
                details: 'Invalid email or password'
            });
        }

        const owner = owners[0];

        const isPasswordValid = await bcrypt.compare(ownerPassword, owner.owner_password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Login failed',
                details: 'Invalid email or password'
            });
        }

        const [applications] = await pool.query(
            'SELECT applicationId FROM carwash_applications WHERE ownerId = ?',
            [owner.owner_id]
        );
        const hasApplication = applications.length > 0;

        res.json({
            message: "Login successful",
            owner: {
                id: owner.owner_id,
                first_name: owner.owner_first_name,
                last_name: owner.owner_last_name,
                email: owner.owner_email,
                // ...other fields as needed
            },
            hasApplication
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server error during login',
            details: error.message
        });
    }
});

module.exports = router;