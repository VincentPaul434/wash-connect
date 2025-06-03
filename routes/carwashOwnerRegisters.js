const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.post('/register-carwash-owner', async (req, res) => {
    const {
        ownerFirstName,
        ownerLastName,
        ownerEmail,
        ownerPassword,
        ownerPhone,
        ownerAddress
    } = req.body;

    try {
        const requiredFields = ['ownerFirstName', 'ownerLastName', 'ownerEmail', 'ownerPassword'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields
            });
        }

        if (ownerPassword.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        const emailCheckQuery = 'SELECT owner_id FROM carwash_owners WHERE owner_email = ?';
        const [existingOwners] = await pool.execute(emailCheckQuery, [ownerEmail]);
        
        if (existingOwners.length > 0) {
            return res.status(400).json({ 
                error: 'Owner email already registered' 
            });
        }

        const hashedPassword = await bcrypt.hash(ownerPassword, 12);
        
        const insertOwnerQuery = `
            INSERT INTO carwash_owners 
            (owner_first_name, owner_last_name, owner_email, owner_password, 
             owner_phone, owner_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [ownerResult] = await pool.execute(insertOwnerQuery, [
            ownerFirstName,
            ownerLastName,
            ownerEmail,
            hashedPassword,
            ownerPhone,
            ownerAddress
        ]);

        const ownerId = ownerResult.insertId;

        // Successful response (don't return password hash)
        res.status(201).json({
            success: true,
            message: 'Carwash owner registration successful',
            ownerId,
            ownerEmail,
            ownerFirstName,
            ownerLastName
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                error: 'Duplicate entry',
                details: 'Email already exists'
            });
        }
        
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
});

module.exports = router;