const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Azure Cosmos DB setup
async function setupCosmosDB() {
  const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
  });

  const { database } = await cosmosClient.databases.createIfNotExists({ id: process.env.COSMOS_DATABASE });
  console.log(`Database ${database.id} created or already exists`);

  const { container: freelancerContainer } = await database.containers.createIfNotExists({ id: 'freelancers' });
  console.log(`Container ${freelancerContainer.id} created or already exists`);

  const { container: formDataContainer } = await database.containers.createIfNotExists({ id: 'formdata' });
  console.log(`Container ${formDataContainer.id} created or already exists`);

  const { container: userContainer } = await database.containers.createIfNotExists({ id: 'users' });
  console.log(`Container ${userContainer.id} created or already exists`);

  return { database, freelancerContainer, formDataContainer, userContainer };
}

// Call this function before starting your server
setupCosmosDB().then(({ database, freelancerContainer, formDataContainer, userContainer }) => {
  // Store these in global variables or pass them to your route handlers
  app.locals.database = database;
  app.locals.freelancerContainer = freelancerContainer;
  app.locals.formDataContainer = formDataContainer;
  app.locals.userContainer = userContainer;

  // Start your server here
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to set up Cosmos DB:', error);
  process.exit(1);
});

// Azure Blob Storage setup
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_NAME);

// Google OAuth client setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(CLIENT_ID);

// File upload middleware
const upload = multer({ storage: multer.memoryStorage() });

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

app.post('/api/login', async (req, res) => {
  const userContainer = app.locals.userContainer;
  try {
    const { email, password } = req.body;
    const { resources: users } = await userContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }]
      })
      .fetchAll();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ userId: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

app.post('/api/register-freelancer', async (req, res) => {
  const freelancerContainer = app.locals.freelancerContainer;
  try {
    const { name, email, password } = req.body;
    const { resources: existingFreelancers } = await freelancerContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }]
      })
      .fetchAll();

    if (existingFreelancers.length > 0) {
      return res.status(400).json({ message: 'Freelancer already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { resource: newFreelancer } = await freelancerContainer.items.create({ name, email, password: hashedPassword });
    
    // Send request to email server
    fetch('http://localhost:5002/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, type: 'freelancer' })
    });

    res.status(201).json({ message: 'Freelancer registered successfully', freelancerId: newFreelancer.id });
  } catch (error) {
    console.error('Freelancer registration error:', error);
    res.status(500).json({ message: 'Error during freelancer registration' });
  }
});

app.post('/api/verify-google-token-freelancer', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    const { resources: existingFreelancers } = await freelancerContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.googleId = @googleId",
        parameters: [{ name: "@googleId", value: googleId }]
      })
      .fetchAll();

    let freelancer;
    if (existingFreelancers.length === 0) {
      const { resource: newFreelancer } = await freelancerContainer.items.create({ name, email, googleId });
      freelancer = newFreelancer;
      
      // Send request to email server
      fetch('http://localhost:5002/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, type: 'freelancer' })
      });
    } else {
      freelancer = existingFreelancers[0];
    }

    res.json({ freelancerId: freelancer.id, email: freelancer.email, name: freelancer.name });
  } catch (error) {
    console.error('Error verifying Google token for freelancer:', error);
    res.status(400).json({ error: 'Invalid token', details: error.message });
  }
});

app.post('/api/form-submit', upload.single('sampleFile'), async (req, res) => {
  console.log('Entering form-submit route');
  
  const formDataContainer = app.locals.formDataContainer;

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
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(req.file.buffer, req.file.size);
    formData.sampleFile = blockBlobClient.url;
  }

  console.log('Received form submission:', formData);
  console.log('User data:', userData);
  
  try {
    const newFormData = {
      ...formData,
      userId: userData?.userId,
      userEmail: userData?.email,
      userName: userData?.name
    };

    console.log('Attempting to create new form document');
    console.log('New form data to be inserted:', newFormData);

    const { resource: newForm } = await formDataContainer.items.create(newFormData);

    console.log('Form created successfully:', newForm);

    // Send request to email server
    if (userData?.email && userData?.name) {
      fetch('http://localhost:5002/api/send-thank-you-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, name: userData.name })
      });
    }

    res.status(200).json({ message: 'Form submitted successfully!', formId: newForm.id });
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error submitting form', error: error.toString(), stack: error.stack });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { resources: existingUsers } = await userContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }]
      })
      .fetchAll();

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { resource: newUser } = await userContainer.items.create({ name, email, password: hashedPassword });
    
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

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

app.post('/api/verify-google-token', async (req, res) => {
  const { token } = req.body;
  try {
    console.log('Received token:', token);
    console.log('Using CLIENT_ID:', CLIENT_ID);
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    const { resources: existingUsers } = await userContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.googleId = @googleId",
        parameters: [{ name: "@googleId", value: googleId }]
      })
      .fetchAll();

    let user;
    if (existingUsers.length === 0) {
      const { resource: newUser } = await userContainer.items.create({ name, email, googleId });
      user = newUser;
      
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
    } else {
      user = existingUsers[0];
    }

    res.json({ userId: user.id, email: user.email, name: user.name });
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
  res.status(500).json({ error: 'An unexpected error occurred' });
});