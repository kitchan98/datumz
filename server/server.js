const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Create uploads folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Google OAuth client setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Email service setup
let transporter;

const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendWelcomeEmail = async (to, name) => {
  if (!transporter) {
    initializeEmailService();
  }

  try {
    let info = await transporter.sendMail({
      from: '"DatumZ" <' + process.env.EMAIL_USER + '>',
      to: to,
      subject: 'Welcome to Our Platform!',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for registering with our platform. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>DatumZ</p>
      `,
    });

    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const sendThankYouEmail = async (to, name) => {
  if (!transporter) {
    initializeEmailService();
  }

  try {
    let info = await transporter.sendMail({
      from: '"DatumZ" <' + process.env.EMAIL_USER + '>',
      to: to,
      subject: 'Thank You for Submitting Data',
      html: `
        <h1>Thank You, ${name}!</h1>
        <p>We appreciate your data submission. Our team will review it shortly.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>DatumZ</p>
      `,
    });

    console.log('Thank you email sent successfully');
  } catch (error) {
    console.error('Error sending thank you email:', error);
  }
};

initializeEmailService();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/formDataDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Define schemas
const formSchema = new mongoose.Schema({
  description: String,
  category: String,
  budget: String,
  type: String,
  quantity: String,
  frequency: String,
  details: String,
  sampleFile: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  googleId: String,
});

// Create models
const FormData = mongoose.model('FormData', formSchema);
const User = mongoose.model('User', userSchema);

// API Routes
app.post('/api/form-submit', upload.single('sampleFile'), async (req, res) => {
  const formData = req.body;
  if (req.file) {
    formData.sampleFile = req.file.filename;
  }
  console.log('Received form submission:', formData);
  
  try {
    const form = new FormData(formData);
    await form.save();
    res.status(200).json({ message: 'Form submitted successfully!', formData });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting form', error });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    await sendWelcomeEmail(email, name);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

app.post('/api/verify-google-token', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ name, email, googleId });
      await user.save();
      await sendWelcomeEmail(email, name);
    } else {
      await sendThankYouEmail(email, name);
    }

    res.json({ userId: user._id, email, name });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(400).json({ error: 'Invalid token', details: error.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});