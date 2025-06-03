const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        phone,
        address,
        birth_date
    } = req.body;

    try {
        // Check if user already exists
        const checkUser = 'SELECT email FROM users WHERE email = ?';
        const [existingUser] = await pool.execute(checkUser, [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users 
            (first_name, last_name, email, password, phone, address, birth_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone,
            address,
            birth_date
        ]);

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Test route to generate a sample token (for testing purposes)
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

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const sql = 'SELECT id, first_name, last_name, email, password FROM users WHERE email = ?';
        const [users] = await pool.execute(sql, [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return success response (don't include password)
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Protected route - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const sql = 'SELECT id, first_name, last_name, email, phone, address, birth_date FROM users WHERE id = ?';
        const [users] = await pool.execute(sql, [req.user.userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile retrieved successfully',
            user: users[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Protected route - Edit user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        birth_date
    } = req.body;

    try {
        // Validate input - at least one field should be provided
        if (!first_name && !last_name && !email && !phone && !address && !birth_date) {
            return res.status(400).json({ error: 'At least one field must be provided for update' });
        }

        // Check if email is being changed and if it already exists
        if (email) {
            const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
            const [existingUsers] = await pool.execute(checkEmailSql, [email, req.user.userId]);
            
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        // Build dynamic SQL query based on provided fields
        const fieldsToUpdate = [];
        const values = [];

        if (first_name) {
            fieldsToUpdate.push('first_name = ?');
            values.push(first_name);
        }
        if (last_name) {
            fieldsToUpdate.push('last_name = ?');
            values.push(last_name);
        }
        if (email) {
            fieldsToUpdate.push('email = ?');
            values.push(email);
        }
        if (phone) {
            fieldsToUpdate.push('phone = ?');
            values.push(phone);
        }
        if (address) {
            fieldsToUpdate.push('address = ?');
            values.push(address);
        }
        if (birth_date) {
            fieldsToUpdate.push('birth_date = ?');
            values.push(birth_date);
        }

        // Add user ID for WHERE clause
        values.push(req.user.userId);

        const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        const [result] = await pool.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get updated user data to return
        const getUserSql = 'SELECT id, first_name, last_name, email, phone, address, birth_date FROM users WHERE id = ?';
        const [updatedUser] = await pool.execute(getUserSql, [req.user.userId]);

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser[0]
        });

    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Database error' });
        }
    }
});

// Protected route - Change password (separate from profile edit)
router.put('/change-password', authenticateToken, async (req, res) => {
    const { current_password, new_password } = req.body;

    try {
        // Validate input
        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Get current password hash
        const getUserSql = 'SELECT password FROM users WHERE id = ?';
        const [users] = await pool.execute(getUserSql, [req.user.userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        // Update password
        const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
        const [result] = await pool.execute(updateSql, [hashedNewPassword, req.user.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Password changed successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;