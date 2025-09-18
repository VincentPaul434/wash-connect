const express = require('express');
const router = express.Router();
const personnelController = require('../Controller/personnelController');

router.get('/personnel/by-owner/:ownerId', personnelController.getPersonnelByOwner);
router.post('/personnel', personnelController.addPersonnel);
router.post('/personnel/assign', personnelController.assignPersonnel);

module.exports = router;