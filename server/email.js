const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.EMAIL_PORT || 5002;

app.use(express.json());

// Email service setup
let transporter;

const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // This is typically the SMTP server for institutional Office 365 accounts
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    initializeEmailService();
  }

  try {
    const info = await transporter.sendMail({
      from: `"DatumZ" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`${subject} email sent successfully:`, info);
    return info;
  } catch (error) {
    console.error(`Error sending ${subject} email:`, error);
    throw error;
  }
};

app.post('/api/send-welcome-email', async (req, res) => {
  const { email, name, type } = req.body;
  const subject = 'Welcome to Our Platform!';
  const html = `
    <h1>Welcome, ${name}!</h1>
    <p>Thank you for registering with our platform as a ${type}. We're excited to have you on board!</p>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Best regards,<br>DatumZ</p>
  `;
  
  try {
    await sendEmail(email, subject, html);
    res.status(200).json({ message: 'Welcome email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending welcome email', error: error.message });
  }
});

app.post('/api/send-thank-you-email', async (req, res) => {
  const { email, name } = req.body;
  const subject = 'Thank You for Submitting Data';
  const html = `
    <h1>Thank You, ${name}!</h1>
    <p>We appreciate your data submission. Our team will review it shortly.</p>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Best regards,<br>DatumZ</p>
  `;
  
  try {
    await sendEmail(email, subject, html);
    res.status(200).json({ message: 'Thank you email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending thank you email', error: error.message });
  }
});

initializeEmailService();

app.listen(PORT, () => {
  console.log(`Email server is running on port ${PORT}`);
});