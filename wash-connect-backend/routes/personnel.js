const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: "uploads/personnel/" });
const personnelController = require('../Controller/personnelController');
const bookingController = require('../Controller/bookingController');

router.get('/personnel/by-owner/:ownerId', personnelController.getPersonnelByOwner);
router.post('/personnel/assign', personnelController.assignPersonnel); // optional: remove if not used
router.post("/personnel", upload.single("avatar"), personnelController.createPersonnel);
router.get('/personnel/:personnelId', personnelController.getPersonnelById);

// NEW: assign a personnel to a service
router.post('/personnel/assign-to-service', personnelController.assignToService);

// NEW: list personnel assigned to a specific service
router.get('/personnel/by-service/:serviceId', personnelController.getPersonnelByService);
router.get('/personnel/:personnel_id/availability', personnelController.getPersonnelAvailability);
router.get('/bookings/by-date-time', bookingController.getBookingsByDateTime);
router.put("/personnel/:personnelId", upload.single("avatar"), personnelController.editPersonnel);

module.exports = router;