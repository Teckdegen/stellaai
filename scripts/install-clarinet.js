const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

// Only run on Vercel
if (process.env.VERCEL) {
  try {
    // Create a directory for Clarinet
    const clarinetDir = join(process.env.VERCEL_BUILD_DIR || '/tmp', 'clarinet-bin');
    if (!existsSync(clarinetDir)) {
      mkdirSync(clarinetDir, { recursive: true });
    }
    
    // Download Clarinet CLI for Linux (Vercel uses Linux)
    const clarinetPath = join(clarinetDir, 'clarinet');
    
    // Use curl with quiet mode to reduce output
    execSync(`curl -s -L --retry 3 --retry-delay 2 https://github.com/hirosystems/clarinet/releases/download/v3.8.0/clarinet-linux-x64 -o ${clarinetPath}`);
    
    // Make it executable
    execSync(`chmod +x ${clarinetPath}`);
    
    // Test the installation quietly
    execSync(`${clarinetPath} --version`, { stdio: 'ignore' });
    
    // Success message
    console.log('Clarinet CLI installed successfully');
  } catch (error) {
    // Silent fail - continue without Clarinet CLI
  }
}