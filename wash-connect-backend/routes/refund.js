const express = require('express');
const router = express.Router();
const refundController = require('../Controller/refundController');

router.post('/', refundController.createRefundRequest);
router.get('/', refundController.getRefundRequests);
router.patch('/:id/status', refundController.updateRefundStatus);

module.exports = router;