const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/shops', async (req, res) => {
    try {
        const [shops] = await pool.query(`
            SELECT 
                a.applicationId,
                a.carwashName,
                a.location,
                a.status, -- 'Active', 'Banned', 'Reported'
                o.owner_id,
                o.owner_first_name,
                o.owner_last_name,
                o.owner_email
            FROM carwash_applications a
            JOIN carwash_owners o ON a.ownerId = o.owner_id
            WHERE a.status IN ('Approved', 'Banned', 'Reported')
            ORDER BY a.applicationId DESC
        `);
        res.json(shops);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shops', details: error.message });
    }
});

// Ban a carwash shop
router.patch('/shops/:id/ban', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE carwash_applications SET status = "Banned" WHERE applicationId = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json({ message: 'Shop banned successfully' });
    } catch (error) {
        console.error(error); // Add this for debugging
        res.status(500).json({ error: 'Failed to ban shop', details: error.message });
    }
});


router.patch('/shops/:id/enable', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE carwash_applications SET status = "Approved" WHERE applicationId = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json({ message: 'Shop enabled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to enable shop', details: error.message });
    }
});


router.patch('/shops/:id/report', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE carwash_applications SET status = "Reported" WHERE applicationId = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json({ message: 'Shop reported successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to report shop', details: error.message });
    }
});

module.exports = router;