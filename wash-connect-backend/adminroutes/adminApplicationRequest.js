const express = require('express');
const pool = require('../db');
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendMail(to, subject, text) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
}


router.get('/applications', async (req, res) => {
    try {
        const [applications] = await pool.query(`
            SELECT 
                a.applicationId,
                a.carwashName,
                a.location,
                a.status,
                a.created_at,
                a.logo AS logo_path, -- Make sure your column is named 'logo'
                o.owner_id,
                o.owner_first_name,
                o.owner_last_name,
                o.owner_email
            FROM carwash_applications a
            JOIN carwash_owners o ON a.ownerId = o.owner_id
            ORDER BY a.created_at DESC
        `);
        // Map logo_path to a full URL
        const withLogoUrl = applications.map(app => ({
            ...app,
            logoUrl: app.logo_path
                ? `${req.protocol}://${req.get('host')}/uploads/logos/${app.logo_path}`
                : "/default-logo.png"
        }));
        res.json(withLogoUrl);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
    }
});


router.get('/applications/:id', async (req, res) => {
    try {
        const [applications] = await pool.query(`
            SELECT 
                a.applicationId,
                a.carwashName,
                a.location,
                a.status,
                a.created_at,
                o.owner_id,
                o.owner_first_name,
                o.owner_last_name,
                o.owner_email
            FROM carwash_applications a
            JOIN carwash_owners o ON a.ownerId = o.owner_id
            WHERE a.applicationId = ?
        `, [req.params.id]);
        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json(applications[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch application', details: error.message });
    }
});



router.patch('/applications/:id/approve', async (req, res) => {
    try {
        // Update status
        const [result] = await pool.query(
            'UPDATE carwash_applications SET status = "Approved" WHERE applicationId = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Get owner email
        const [rows] = await pool.query(
            `SELECT o.owner_email, o.owner_first_name, a.carwashName
             FROM carwash_applications a
             JOIN carwash_owners o ON a.ownerId = o.owner_id
             WHERE a.applicationId = ?`,
            [req.params.id]
        );
        const owner = rows[0];
        if (owner && owner.owner_email) {
            // Send email
            await sendMail(
                owner.owner_email,
                "Carwash Application Approved",
                `Hello ${owner.owner_first_name},\n\nYour carwash "${owner.carwashName}" has been approved!\n\nThank you for using Wash Connect.`
            );
        }

        res.json({ message: 'Application approved and email sent' });
    } catch (error) {
        console.error("Nodemailer error:", error); // <-- Add this line
        res.status(500).json({ error: 'Failed to approve application', details: error.message });
    }
});


router.patch('/applications/:id/decline', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE carwash_applications SET status = "Declined" WHERE applicationId = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Get owner email
        const [rows] = await pool.query(
            `SELECT o.owner_email, o.owner_first_name, a.carwashName
             FROM carwash_applications a
             JOIN carwash_owners o ON a.ownerId = o.owner_id
             WHERE a.applicationId = ?`,
            [req.params.id]
        );
        const owner = rows[0];
        if (owner && owner.owner_email) {
            // Send decline email
            await sendMail(
                owner.owner_email,
                "Carwash Application Declined",
                `Hello ${owner.owner_first_name},\n\nWe regret to inform you that your carwash "${owner.carwashName}" application has been declined.\n\nThank you for using Wash Connect.`
            );
        }

        res.json({ message: 'Application declined and email sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to decline application', details: error.message });
    }
});

module.exports = router;