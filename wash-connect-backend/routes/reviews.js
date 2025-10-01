const express = require('express');
const router = express.Router();
const reviewsController = require('../Controller/reviewsController');

router.get('/reviews/:applicationId', reviewsController.getReviewsByApplication);

module.exports = router;