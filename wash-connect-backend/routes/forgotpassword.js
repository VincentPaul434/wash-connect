const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../Controller/forgotPasswordController');

// POST /api/forgot-password
router.post('/', forgotPasswordController.requestPasswordReset);

module.exports = router;