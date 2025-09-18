const express = require('express');
const router = express.Router();
const feedbackController = require('../Controller/feedbackController');

router.post('/bookings/feedbacks/:appointmentId', feedbackController.submitFeedback);

module.exports = router;