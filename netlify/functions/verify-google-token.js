const { OAuth2Client } = require('google-auth-library');
const { CosmosClient } = require('@azure/cosmos');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { token } = JSON.parse(event.body);
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    const cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });

    const database = cosmosClient.database(process.env.COSMOS_DATABASE);
    const userContainer = database.container('users');

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
    } else {
      user = existingUsers[0];
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ userId: user.id, email: user.email, name: user.name })
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid token', details: error.toString() })
    };
  }
};