import mongoose from 'mongoose';
// Import models
import '../models/User';
import '../models/Project';
import '../models/Event';
import '../models/MentorshipSession';

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Simple connection without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB and indexes created');

    // Create indexes after models are registered
    await Promise.all([
      mongoose.model('User').createIndexes(),
      mongoose.model('Project').createIndexes(),
      mongoose.model('Event').createIndexes(),
      mongoose.model('MentorshipSession').createIndexes()
    ]);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
