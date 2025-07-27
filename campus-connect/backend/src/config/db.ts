import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      retryConnection();
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
      retryConnection();
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    await retryConnection();
  }
};

const retryConnection = async (retryCount = 0) => {
  const maxRetries = 5;
  const baseDelay = 1000;

  if (retryCount >= maxRetries) {
    console.error('Max retry attempts reached. Please check your MongoDB configuration.');
    process.exit(1);
  }

  const delay = baseDelay * Math.pow(2, retryCount);
  console.log(`Retrying connection in ${delay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);

  try {
    await new Promise(resolve => setTimeout(resolve, delay));
    await connectDB();
  } catch (error) {
    await retryConnection(retryCount + 1);
  }
};

export default connectDB;
