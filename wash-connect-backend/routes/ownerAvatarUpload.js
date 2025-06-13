const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    // Use owner id and timestamp for unique file names
    cb(null, `owner_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Make sure the uploads/avatars directory exists!

// POST /api/carwash-owners/:id/avatar
router.post('/carwash-owners/:id/avatar', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const ownerId = req.params.id;

    // Update the avatar path in the database
    await pool.query(
      "UPDATE carwash_owners SET owner_avatar = ? WHERE owner_id = ?",
      [avatarPath, ownerId]
    );

    res.json({ avatar: avatarPath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;