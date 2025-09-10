const express = require('express');
const pool = require('../db');

const router = express.Router();


router.get('/customers', async (req, res) => {
    try {
        const [customers] = await pool.query(`
            SELECT 
                user_id,
                first_name,
                last_name,
                email,
                phone,
                address,
                birth_date,
                gender,
                status -- status should be a column in your users table (e.g., 'Active', 'Banned', 'Reported')
            FROM users
        `);

        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    }   
});

router.patch('/customers/ban/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query("UPDATE users SET status = 'Banned' WHERE user_id = ?", [userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ban customer', details: error.message });
  }
});

router.patch('/customers/unban/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query("UPDATE users SET status = 'Active' WHERE user_id = ?", [userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unban customer', details: error.message });
  }
});

module.exports = router;