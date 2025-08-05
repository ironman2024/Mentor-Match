export const validateEnvironmentVariables = () => {
  console.log('🔍 Checking environment variables...');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('JWT') || key.includes('PORT') || key.includes('NODE')));
  
  // Set defaults for missing environment variables
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not found, using default (not secure for production)');
    process.env.JWT_SECRET = 'campus_connect_b2c77d8e9a4f5c6b3a2e1d';
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is required');
    console.error('💡 For Render deployment, set MONGODB_URI in your service environment variables');
    console.error('🔧 Go to Render Dashboard > Your Service > Environment > Add Environment Variable');
    throw new Error('MONGODB_URI environment variable is required');
  }

  console.log('✅ Environment variables validated');
};