const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/avatars/' });
const carwashOwnerRegisterController = require('../Controller/carwashOwnerRegister');

router.post('/register-carwash-owner', upload.single('avatar'), carwashOwnerRegisterController.registerCarwashOwner);

module.exports = router;