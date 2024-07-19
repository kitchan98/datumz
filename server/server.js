// server.js
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5001; // Changed port to 5001

// Enable CORS
app.use(cors());

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

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/formDataDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Define a schema
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

// Create a model
const FormData = mongoose.model('FormData', formSchema);

// Route to handle form submission
app.post('/api/form-submit', upload.single('sampleFile'), async (req, res) => {
  const formData = req.body;
  if (req.file) {
    formData.sampleFile = req.file.filename;
  }
  console.log('Received form submission:', formData);
  
  // Save form data to MongoDB
  try {
    const form = new FormData(formData);
    await form.save();
    res.status(200).json({ message: 'Form submitted successfully!', formData });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting form', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
