const express = require('express');
const router = express.Router();
const feedbackController = require('../Controller/feedbackController');

router.post('/feedback/:appointmentId', feedbackController.submitFeedback);
router.get('/reviews/by-application/:applicationId', feedbackController.getReviewsByApplication);

module.exports = router;