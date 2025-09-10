const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        phone,
        address,
        birth_date,
        gender
    } = req.body;

    try {
        // Check if user already exists by email
        const checkUser = 'SELECT email FROM users WHERE email = ?';
        const [existingUser] = await pool.execute(checkUser, [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into DB, including gender
        const sql = `
            INSERT INTO users 
            (first_name, last_name, email, password, phone, address, birth_date, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone,
            address,
            birth_date,
            gender
        ]);

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
