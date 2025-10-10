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
      
      // Check if Clarinet is already downloaded
      const clarinetBinary = join(clarinetDir, 'clarinet');
      if (existsSync(clarinetBinary)) {
        console.log('[Clarinet Installer] Clarinet already installed');
        // Test if it works
        try {
          const version = execSync(`${clarinetBinary} --version`, { encoding: 'utf-8' });
          console.log('[Clarinet Installer] Clarinet version:', version.trim());
          return;
        } catch (testError) {
          console.log('[Clarinet Installer] Existing binary broken, reinstalling...');
        }
      }
      
      // Download and install Clarinet
      console.log('[Clarinet Installer] Downloading Clarinet...');
      try {
        execSync(
          `cd ${clarinetDir} && curl -L -o clarinet.tar.gz https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-x86_64-unknown-linux-gnu.tar.gz`,
          { stdio: 'inherit' }
        );
      } catch (downloadError) {
        console.log('[Clarinet Installer] curl failed, trying wget...');
        try {
          execSync(
            `cd ${clarinetDir} && wget -O clarinet.tar.gz https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-x86_64-unknown-linux-gnu.tar.gz`,
            { stdio: 'inherit' }
          );
        } catch (wgetError) {
          console.log('[Clarinet Installer] Both curl and wget failed, trying with node fetch...');
          // Fallback to node fetch if both curl and wget fail
          const fs = require('fs');
          const https = require('https');
          
          const file = fs.createWriteStream(join(clarinetDir, 'clarinet.tar.gz'));
          https.get('https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-x86_64-unknown-linux-gnu.tar.gz', (response) => {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log('[Clarinet Installer] Download completed with node fetch');
            });
          }).on('error', (err) => {
            console.error('[Clarinet Installer] Node fetch also failed:', err);
            throw err;
          });
        }
      }
      
      console.log('[Clarinet Installer] Extracting Clarinet...');
      execSync(
        `cd ${clarinetDir} && tar -xzf clarinet.tar.gz`,
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
    // Don't exit with error code as this shouldn't fail the build
  }
}

// Run the installation
installClarinet().catch(error => {
  console.error('[Clarinet Installer] Fatal error:', error);
  // Don't exit with error code as this shouldn't fail the build
});