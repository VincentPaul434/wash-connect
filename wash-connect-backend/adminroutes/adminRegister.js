const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, numberId, password, confirmPassword, phone, address, gender, birthdate } = req.body;

        if (!firstName || !lastName || !numberId || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        // Validate numberId format (e.g., 201-301-3987)
        const numberIdRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!numberIdRegex.test(numberId)) {
            return res.status(400).json({ message: 'Invalid Number ID format. Use XXX-XXX-XXXX.' });
        }

        // Check if admin already exists
        const [existingAdmins] = await pool.query('SELECT * FROM admins WHERE numberId = ?', [numberId]);
        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: 'Admin with this Number ID already exists.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO admins (firstName, lastName, numberId, password, phone, address, gender, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, numberId, hashedPassword, phone, address, gender, birthdate]
        );

        res.status(201).json({ message: 'Admin registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;