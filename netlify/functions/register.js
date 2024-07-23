const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { name, email, password } = JSON.parse(event.body);

    // Validate input
    if (!name || !email || !password) {
      throw new Error('Missing required fields');
    }

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
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'User already exists' })
      };
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const { resource: newUser } = await userContainer.items.create({ name, email, password: hashedPassword });

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'User registered successfully', userId: newUser.id })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Error during registration', error: error.toString() })
    };
  }
};
