const express = require('express');
const router = express.Router();
const carwashOwnersController = require('../Controller/carwashOwnersController');

router.get('/carwash-owners/:ownerId', carwashOwnersController.getCarwashOwner);

module.exports = router;