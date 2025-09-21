const express = require('express');
const router = express.Router();
const personnelController = require('../Controller/personnelController');

router.get('/personnel/by-owner/:ownerId', personnelController.getPersonnelByOwner);
router.post('/personnel/assign', personnelController.assignPersonnel); // optional: remove if not used
router.post('/personnel', personnelController.createPersonnel);
router.get('/personnel/:personnelId', personnelController.getPersonnelById);

// NEW: assign a personnel to a service
router.post('/personnel/assign-to-service', personnelController.assignToService);

// NEW: list personnel assigned to a specific service
router.get('/personnel/by-service/:serviceId', personnelController.getPersonnelByService);

module.exports = router;