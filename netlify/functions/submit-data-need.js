const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const multipart = require('parse-multipart-data');

exports.handler = async (event) => {
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
    console.log('Received event:', event);

    // Parse the multipart form data
    const formData = await parseMultipartForm(event);
    console.log('Parsed form data:', formData);

    // Set up Azure clients
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_NAME);

    const cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });
    const database = cosmosClient.database(process.env.COSMOS_DATABASE);
    const container = database.container('formdata'); // Update to use an existing container

    // Handle file upload if present
    let fileUrl = null;
    if (formData.sampleFile) {
      console.log('Uploading file:', formData.sampleFile.filename);
      const blobName = `${Date.now()}-${formData.sampleFile.filename}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(formData.sampleFile.content, formData.sampleFile.content.length);
      fileUrl = blockBlobClient.url;
      console.log('File uploaded successfully. URL:', fileUrl);
    }

    // Prepare data for Cosmos DB
    const dataToStore = {
      ...formData,
      sampleFile: fileUrl,
      createdAt: new Date().toISOString(),
    };
    console.log('Data to store in Cosmos DB:', dataToStore);

    // Store in Cosmos DB
    const { resource: createdItem } = await container.items.create(dataToStore);
    console.log('Item created in Cosmos DB:', createdItem);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Data need submitted successfully', id: createdItem.id })
    };
  } catch (error) {
    console.error('Error submitting data need:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Error submitting data need', error: error.toString() })
    };
  }
};

// Helper function to parse multipart form data
async function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      reject(new Error('Content-Type must be multipart/form-data'));
    }

    const boundary = contentType.split('boundary=')[1];
    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);

    const formData = {};
    parts.forEach(part => {
      if (part.filename) {
        // This is a file
        formData[part.name] = {
          filename: part.filename,
          contentType: part.type,
          content: part.data
        };
      } else {
        // This is a regular field
        formData[part.name] = part.data.toString('utf8');
      }
    });

    // Parse the userData JSON if it exists
    if (formData.userData) {
      try {
        formData.userData = JSON.parse(formData.userData);
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }

    resolve(formData);
  });
}
