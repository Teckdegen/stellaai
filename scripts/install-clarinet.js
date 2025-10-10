const { execSync } = require('child_process');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

console.log('Installing Clarinet CLI...');

// Check if we're on Vercel
if (process.env.VERCEL) {
  console.log('Running on Vercel, installing Clarinet CLI...');
  
  try {
    // Create a directory for Clarinet
    const clarinetDir = join(process.env.VERCEL_BUILD_DIR || '/tmp', 'clarinet-bin');
    if (!existsSync(clarinetDir)) {
      mkdirSync(clarinetDir, { recursive: true });
    }
    
    // Download Clarinet CLI for Linux (Vercel uses Linux)
    const clarinetPath = join(clarinetDir, 'clarinet');
    console.log('Downloading Clarinet CLI to:', clarinetPath);
    
    // Use curl with more robust options
    execSync(`curl -L --retry 3 --retry-delay 2 https://github.com/hirosystems/clarinet/releases/download/v3.8.0/clarinet-linux-x64 -o ${clarinetPath}`, { 
      stdio: 'inherit' 
    });
    
    // Make it executable
    console.log('Making Clarinet CLI executable...');
    execSync(`chmod +x ${clarinetPath}`, { stdio: 'inherit' });
    
    // Test the installation
    console.log('Testing Clarinet CLI installation...');
    execSync(`${clarinetPath} --version`, { stdio: 'inherit' });
    
    console.log('Clarinet CLI installed successfully!');
  } catch (error) {
    console.error('Failed to install Clarinet CLI:', error.message);
    console.log('Continuing without Clarinet CLI...');
  }
} else {
  console.log('Not running on Vercel, skipping Clarinet CLI installation');
}