const bcrypt = require('bcryptjs');
const pool = require('../db');
const nodemailer = require('nodemailer');

async function sendWelcomeEmail(email, firstName) {
  const transporter = nodemailer.createTransport({
    service: email.includes('yahoo.') ? 'yahoo' : 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to WashConnect!',
    text: `Hello ${firstName},\n\nYour account has been created successfully!\n\nThank you for joining WashConnect.`,
  });
}

exports.registerUser = async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        phone,
        address,
        birth_date,
        gender
    } = req.body;

    try {
        // Only allow Gmail or Yahoo emails
        if (!/^[\w.-]+@(gmail\.com|yahoo\.com)$/i.test(email)) {
            return res.status(400).json({ error: 'Only Gmail and Yahoo email addresses are allowed.' });
        }

        // Check if user already exists by email
        const checkUser = 'SELECT email FROM users WHERE email = ?';
        const [existingUser] = await pool.execute(checkUser, [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into DB, including gender
        const sql = `
            INSERT INTO users 
            (first_name, last_name, email, password, phone, address, birth_date, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone,
            address,
            birth_date,
            gender
        ]);

        // Send welcome email
        await sendWelcomeEmail(email, first_name);

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};
