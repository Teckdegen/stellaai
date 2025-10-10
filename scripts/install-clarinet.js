const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

// Function to install Clarinet CLI
async function installClarinet() {
  try {
    const isVercel = !!process.env.VERCEL;
    console.log('[Clarinet Installer] Running in Vercel environment:', isVercel);
    
    if (isVercel) {
      // Vercel build environment - install Clarinet for Linux
      const buildDir = process.env.VERCEL_BUILD_DIR || '/vercel/path0';
      const clarinetDir = join(buildDir, 'clarinet-bin');
      
      console.log('[Clarinet Installer] Installing Clarinet in:', clarinetDir);
      
      // Create directory if it doesn't exist
      if (!existsSync(clarinetDir)) {
        mkdirSync(clarinetDir, { recursive: true });
      }
      
      // Download and install Clarinet
      console.log('[Clarinet Installer] Downloading Clarinet...');
      execSync(
        `cd ${clarinetDir} && wget -q https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-x86_64-unknown-linux-gnu.tar.gz`,
        { stdio: 'inherit' }
      );
      
      console.log('[Clarinet Installer] Extracting Clarinet...');
      execSync(
        `cd ${clarinetDir} && tar -xzf clarinet-x86_64-unknown-linux-gnu.tar.gz`,
        { stdio: 'inherit' }
      );
      
      console.log('[Clarinet Installer] Setting permissions...');
      execSync(
        `cd ${clarinetDir} && chmod +x clarinet`,
        { stdio: 'inherit' }
      );
      
      console.log('[Clarinet Installer] Clarinet installed successfully in:', clarinetDir);
      console.log('[Clarinet Installer] Clarinet version:', execSync(`${join(clarinetDir, 'clarinet')} --version`, { encoding: 'utf-8' }).trim());
    } else {
      // Local development - check if Clarinet is already installed
      try {
        const version = execSync('clarinet --version', { encoding: 'utf-8' });
        console.log('[Clarinet Installer] Clarinet already installed:', version.trim());
      } catch (error) {
        console.log('[Clarinet Installer] Clarinet not found in PATH. Please install manually from https://github.com/hirosystems/clarinet');
      }
    }
  } catch (error) {
    console.error('[Clarinet Installer] Error installing Clarinet:', error.message);
    process.exit(1);
  }
}

// Run the installation
installClarinet().catch(error => {
  console.error('[Clarinet Installer] Fatal error:', error);
  process.exit(1);
});