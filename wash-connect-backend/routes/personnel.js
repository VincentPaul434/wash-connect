const express = require('express');
const router = express.Router();
const personnelController = require('../Controller/personnelController');

router.get('/personnel/by-owner/:ownerId', personnelController.getPersonnelByOwner);
router.post('/personnel/assign', personnelController.assignPersonnel);
router.post('/personnel', personnelController.createPersonnel);
router.get('/personnel/:personnelId', personnelController.getPersonnelById);

module.exports = router;