const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (
    !mongoUri ||
    mongoUri.includes('<username>') ||
    mongoUri.includes('<password>') ||
    mongoUri.includes('<cluster-url>')
  ) {
    throw new Error('MONGODB_URI is not defined. Add it to the backend .env file.');
  }

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDatabase;
