const express = require('express');
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/logos'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Use multer for handling multipart/form-data
router.post(
    '/carwash-applications',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'requirements', maxCount: 1 }
    ]),
    async (req, res) => {
        const { ownerId, carwashName, location } = req.body;
        const logo = req.files['logo'] ? req.files['logo'][0].filename : null;
        const requirements = req.files['requirements'] ? req.files['requirements'][0].filename : null;

        if (!ownerId || !carwashName || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            await pool.query(
                'INSERT INTO carwash_applications (ownerId, carwashName, location, logo, requirements) VALUES (?, ?, ?, ?, ?)',
                [ownerId, carwashName, location, logo, requirements]
            );
            res.status(201).json({ message: 'Application submitted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to submit application', details: error.message });
        }
    }
);


router.get('/carwash-applications/status/:ownerId', async (req, res) => {
    const { ownerId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT applicationId FROM carwash_applications WHERE ownerId = ? LIMIT 1',
            [ownerId]
        );
        if (rows.length > 0) {
            return res.json({ registered: true });
        } else {
            return res.json({ registered: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to check registration status', details: error.message });
    }
});

router.get('/carwash-applications/by-owner/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT applicationId, carwashName, location, logo FROM carwash_applications WHERE ownerId = ? LIMIT 1',
      [ownerId]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "No application found" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application', details: error.message });
  }
});

router.get('/carwash-applications/by-application/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT ownerId FROM carwash_applications WHERE applicationId = ? LIMIT 1',
      [applicationId]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "No application found" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application', details: error.message });
  }
});

router.get('/carwash-applications/approved', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT applicationId, ownerId, carwashName, location, logo FROM carwash_applications WHERE status = "Approved"'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch approved carwash applications', details: error.message });
  }
});

router.get('/carwash-applications/approved-with-appointments', async (req, res) => {
  try {
    // Get all approved carwash companies
    const [carwashes] = await pool.query(
      'SELECT applicationId, carwashName FROM carwash_applications WHERE status = "Approved"'
    );

    // For each carwash, get confirmed appointments with user info
    for (const carwash of carwashes) {
      const [appointments] = await pool.query(
        `SELECT b.appointment_id AS appointmentId, 
                CONCAT(u.first_name, ' ', u.last_name) AS userName, 
                u.email AS userEmail
         FROM bookings b
         JOIN users u ON b.user_id = u.user_id
         WHERE b.applicationId = ? AND b.status = "Confirmed"`,
        [carwash.applicationId]
      );
      carwash.appointments = appointments;
    }

    res.json(carwashes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});


 

module.exports = router;