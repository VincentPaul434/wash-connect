const express = require('express');
const router = express.Router();
const carwashOwnerLoginController = require('../Controller/carwashOwnerLoginController');

router.post('/login-carwash-owner', carwashOwnerLoginController.loginCarwashOwner);

module.exports = router;