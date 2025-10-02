const express = require('express');
const router = express.Router();
const resetPasswordController = require('../Controller/resetPasswordController');

// POST /api/reset-password
router.post('/', resetPasswordController.resetPassword);

module.exports = router;

