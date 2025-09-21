const express = require('express');
const router = express.Router();
const services = require('../Controller/servicesController');

router.get('/by-application/:applicationId', services.getServicesByApplication);
router.post('/', services.createService);
router.patch('/:serviceId', services.updateService);
router.delete('/:serviceId', services.deleteService);

module.exports = router;