const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, password } = JSON.parse(event.body);

    // Set up CosmosDB client
    const cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });

    const database = cosmosClient.database(process.env.COSMOS_DATABASE);
    const userContainer = database.container('users');

    // Check for existing user
    const { resources: existingUsers } = await userContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }]
      })
      .fetchAll();

    if (existingUsers.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ message: 'User already exists' }) };
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const { resource: newUser } = await userContainer.items.create({ name, email, password: hashedPassword });

    // Here you would add code to send emails, but you'll need to set up an email service

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered successfully', userId: newUser.id })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error during registration', error: error.toString() })
    };
  }
};