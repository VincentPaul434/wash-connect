const bcrypt = require('bcryptjs');
const pool = require('../db');

exports.registerCarwashOwner = async (req, res) => {
    // Accept frontend field names
    const {
        ownerFirstName,
        ownerLastName,
        ownerEmail,
        ownerPassword,
        ownerPhone,
        ownerAddress
    } = req.body;

    // Combine first and last name for owner_name
    const owner_name = [ownerFirstName, ownerLastName].filter(Boolean).join(' ').trim();
    const owner_email = ownerEmail;
    const owner_password = ownerPassword;

    if (!owner_name || !owner_email || !owner_password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Hash the password before saving!
        const hashedPassword = await bcrypt.hash(owner_password, 10);

        const [result] = await pool.query(
            `INSERT INTO carwash_owners (owner_first_name, owner_last_name, owner_email, owner_password, owner_phone, owner_address)
             VALUES (?, ?, ?, ?, ?,?)`,
            [ownerFirstName, ownerLastName, owner_email, hashedPassword, ownerPhone || null, ownerAddress || null]
        );

        res.status(201).json({
            success: true,
            message: "Carwash owner registered successfully",
            owner_id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
};
