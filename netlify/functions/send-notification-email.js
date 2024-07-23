const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, name) => {
  console.log('Starting email send process');
  
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: 'kit@datumz.co',
      pass: process.env.OFFICE_EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: '"DatumZ" <kit@datumz.co>',
    to,
    subject,
    html: `
      <p>Hello ${userData.name},</p>
      <p>Thank you for submitting your data need to our platform. We appreciate your interest and trust in our services.</p>
      <p>Our team will carefully review your submission and get back to you shortly with more information or any additional questions we may have.</p>
      <p>Here's a summary of your submission:</p>
      <ul>
        <li>Category: ${formData.category}</li>
        <li>Type: ${formData.type}</li>
        <li>Quantity: ${formData.quantity}</li>
        <li>Frequency: ${formData.frequency}</li>
      </ul>
      <p>If you need to make any changes or have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Kit C</p>
    `
  };

  try {
    console.log('Attempting to send email');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

exports.handler = async (event) => {
    console.log('Function invoked');
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }
  
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        headers, 
        body: JSON.stringify({ message: 'Method Not Allowed' }) 
      };
    }
  
    try {
      console.log('Request body:', event.body);
      console.log('Parsing request body');
      const { subject, email, name } = JSON.parse(event.body);
  
      console.log('Parsed data:', { subject, email, name });
      console.log('Calling sendEmail function');
      
      const emailResult = await sendEmail(email, subject, name);
      console.log('Email sent successfully, result:', emailResult);
  
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Email sent successfully' }),
      };
    } catch (error) {
      console.error('Error in handler:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          message: 'Error sending notification email', 
          error: error.message,
          stack: error.stack
        }),
      };
    }
};
