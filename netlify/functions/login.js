const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    const cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });

    const database = cosmosClient.database(process.env.COSMOS_DATABASE);
    const userContainer = database.container('users');

    const { resources: users } = await userContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }]
      })
      .fetchAll();

    if (users.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ userId: user.id, name: user.name, email: user.email })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred during login', error: error.toString() })
    };
  }
};