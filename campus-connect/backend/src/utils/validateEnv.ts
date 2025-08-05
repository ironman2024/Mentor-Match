export const validateEnvironmentVariables = () => {
  // Set defaults for missing environment variables
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not found, using default (not secure for production)');
    process.env.JWT_SECRET = 'campus_connect_b2c77d8e9a4f5c6b3a2e1d';
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is required');
    throw new Error('MONGODB_URI environment variable is required');
  }

  console.log('✅ Environment variables validated');
};