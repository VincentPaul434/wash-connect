const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/test-token', (req, res) => {
    const testToken = jwt.sign(
        { 
            userId: 999, 
            email: 'test@example.com' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    res.json({
        message: 'Test token generated',
        token: testToken
    });
});

module.exports = router;
