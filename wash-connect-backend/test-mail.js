require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "shadowvator@gmail.com", // use your own email for testing
    subject: "Test Email",
    text: "This is a test email from nodemailer.",
}, (err, info) => {
    if (err) {
        console.error("Nodemailer error:", err);
    } else {
        console.log("Email sent:", info.response);
    }
});