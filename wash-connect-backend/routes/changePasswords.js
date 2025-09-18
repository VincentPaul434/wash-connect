const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const changepasswordController = require('../Controller/changepasswordController');

router.put('/change-password', authenticateToken, changepasswordController.changePassword);

module.exports = router;
