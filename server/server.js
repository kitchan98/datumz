const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sendEmailNotification = async (to, subject, html) => {
  try {
    const response = await fetch('http://localhost:5002/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: to, name: to, subject, html })
    });
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Create uploads folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datumzDB';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Schemas
const freelancerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
});

const formSchema = new mongoose.Schema({
  description: String,
  category: String,
  budget: String,
  type: String,
  quantity: String,
  frequency: String,
  details: String,
  sampleFile: String,
  userId: String,
  userEmail: String,
  userName: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  googleId: String,
});

// Models
const Freelancer = mongoose.model('Freelancer', freelancerSchema);
const FormData = mongoose.model('FormData', formSchema);
const User = mongoose.model('User', userSchema);

// Google OAuth client setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Assuming you're storing hashed passwords and using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// API Routes
app.post('/api/register-freelancer', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingFreelancer = await Freelancer.findOne({ email });
    if (existingFreelancer) {
      return res.status(400).json({ message: 'Freelancer already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const freelancer = new Freelancer({ name, email, password: hashedPassword });
    await freelancer.save();
    
    // Send request to email server
    fetch('http://localhost:5002/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, type: 'freelancer' })
    });

    res.status(201).json({ message: 'Freelancer registered successfully', freelancerId: freelancer._id });
  } catch (error) {
    console.error('Freelancer registration error:', error);
    res.status(500).json({ message: 'Error during freelancer registration' });
  }
});

app.post('/api/verify-google-token-freelancer', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let freelancer = await Freelancer.findOne({ googleId });
    if (!freelancer) {
      freelancer = new Freelancer({ name, email, googleId });
      await freelancer.save();
      
      // Send request to email server
      fetch('http://localhost:5002/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, type: 'freelancer' })
      });
    }

    res.json({ freelancerId: freelancer._id, email, name });
  } catch (error) {
    console.error('Error verifying Google token for freelancer:', error);
    res.status(400).json({ error: 'Invalid token', details: error.message });
  }
});

app.post('/api/form-submit', upload.single('sampleFile'), async (req, res) => {
  const formData = req.body;
  let userData;
  
  if (formData.userData) {
    try {
      userData = JSON.parse(formData.userData);
      delete formData.userData;
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }

  if (req.file) {
    formData.sampleFile = req.file.filename;
  }

  console.log('Received form submission:', formData);
  console.log('User data:', userData);
  
  try {
    const form = new FormData({
      ...formData,
      userId: userData?.userId,
      userEmail: userData?.email,
      userName: userData?.name
    });
    await form.save();

    // Send request to email server
    if (userData?.email && userData?.name) {
      fetch('http://localhost:5002/api/send-thank-you-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, name: userData.name })
      });
    }

    res.status(200).json({ message: 'Form submitted successfully!', formData });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.status(500).json({ message: 'Error submitting form', error });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    
    // Send welcome email to user
    sendEmailNotification(
      email,
      'Welcome to Our Platform!',
      `<h1>Welcome, ${name}!</h1><p>Thank you for registering with our platform. We're excited to have you on board!</p>`
    );

    // Notify developer
    sendEmailNotification(
      process.env.DEVELOPER_EMAIL,
      'New User Registration',
      `<h1>New User Registered</h1><p>A new user has registered:</p><p>Name: ${name}</p><p>Email: ${email}</p>`
    );

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(409).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Error during registration' });
  }
});

app.post('/api/verify-google-token', async (req, res) => {
  const { token } = req.body;
  try {
    console.log('Received token:', token);
    console.log('Using CLIENT_ID:', CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ name, email, googleId });
      await user.save();
      
      // Send welcome email to user
      sendEmailNotification(
        email,
        'Welcome to Our Platform!',
        `<h1>Welcome, ${name}!</h1><p>Thank you for registering with our platform using Google. We're excited to have you on board!</p>`
      );

      // Notify developer
      sendEmailNotification(
        process.env.DEVELOPER_EMAIL,
        'New User Registration via Google',
        `<h1>New User Registered via Google</h1><p>A new user has registered:</p><p>Name: ${name}</p><p>Email: ${email}</p>`
      );
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