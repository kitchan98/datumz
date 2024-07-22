const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { subject, email, name } = JSON.parse(event.body);

    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_FROM}>`,
      to: process.env.NOTIFICATION_EMAIL, // This could be an admin email
      subject: subject,
      html: `
        <h1>New User Registration</h1>
        <p>A new user has registered:</p>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
      `,
    });

    console.log('Message sent: %s', info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending notification email', error: error.toString() })
    };
  }
};