export const validateEnvironmentVariables = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars: string[] = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please set these environment variables in your deployment platform or .env file');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  console.log('✅ All required environment variables are set');
};