const fs = require('fs');
const path = require('path');

function copyEnvFile(source, destinations) {
  try {
    if (fs.existsSync(source)) {
      // Read source file
      const envContent = fs.readFileSync(source, 'utf8');
      
      // Copy to each destination
      destinations.forEach(destination => {
        const destDir = path.dirname(destination);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.writeFileSync(destination, envContent.replace(/\r\n/g, '\n'));
        console.log(`✅ Copied ${source} to ${destination}`);
      });
    } else {
      console.warn(`⚠️ Source file ${source} not found`);
      
      if (process.env.VERCEL) {
        console.log('📦 Running in Vercel environment, skipping file copy');
        return;
      }
      
      // Create example .env file if it doesn't exist
      const exampleEnv = `# Client Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Environment Variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
`;
      
      fs.writeFileSync(source, exampleEnv);
      console.log(`📝 Created example ${source} file`);
      throw new Error(`Please configure your ${source} file with actual values`);
    }
  } catch (error) {
    console.error(`❌ Error handling ${source}:`, error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// Log environment for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: !!process.env.VERCEL,
});

// Copy .env file to both client and server
copyEnvFile(
  path.join(__dirname, '.env'),
  [
    path.join(__dirname, 'apps/client/.env.local'),
    path.join(__dirname, 'apps/server/.env.local')
  ]
);

// Verify environment files were created
const verifyEnvFiles = () => {
  const files = [
    path.join(__dirname, 'apps/client/.env.local'),
    path.join(__dirname, 'apps/server/.env.local')
  ];
  
  const results = files.map(file => ({
    path: file,
    exists: fs.existsSync(file)
  }));
  
  console.log('Environment files status:', 
    results.reduce((acc, {path, exists}) => ({
      ...acc,
      [path]: exists ? '✅' : '❌'
    }), {})
  );
  
  if (!process.env.VERCEL && results.some(r => !r.exists)) {
    throw new Error('Environment setup failed');
  }
};

verifyEnvFiles(); 