const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const multipart = require('multipart-formdata');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the multipart form data
    const formData = await parseMultipartForm(event);

    // Set up Azure clients
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_NAME);

    const cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });
    const database = cosmosClient.database(process.env.COSMOS_DATABASE);
    const container = database.container('dataneeds');

    // Handle file upload if present
    let fileUrl = null;
    if (formData.sampleFile) {
      const blobName = `${Date.now()}-${formData.sampleFile.filename}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(formData.sampleFile.content, formData.sampleFile.content.length);
      fileUrl = blockBlobClient.url;
    }

    // Prepare data for Cosmos DB
    const dataToStore = {
      ...formData,
      sampleFile: fileUrl,
      createdAt: new Date().toISOString(),
    };

    // Store in Cosmos DB
    const { resource: createdItem } = await container.items.create(dataToStore);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data need submitted successfully', id: createdItem.id })
    };
  } catch (error) {
    console.error('Error submitting data need:', error);
    return {
      statusCode: 500,
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