import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir, platform } from 'os';

const execPromise = promisify(exec);

// Function to setup Clarinet CLI
async function setupClarinetCLI(): Promise<string> {
  const isVercel = !!process.env.VERCEL;
  
  if (isVercel) {
    // On Vercel, check if Clarinet CLI was installed in the build process
    try {
      // Check if clarinet is available in the custom path
      const clarinetDir = join(process.env.VERCEL_BUILD_DIR || '/tmp', 'clarinet-bin');
      const clarinetPath = join(clarinetDir, 'clarinet');
      
      // Test if the file exists and is executable
      await execPromise(`test -f ${clarinetPath} && chmod +x ${clarinetPath}`, { timeout: 5000 });
      return clarinetPath;
    } catch (error) {
      // Try to use system clarinet
      try {
        await execPromise('which clarinet', { timeout: 5000 });
        return 'clarinet';
      } catch (fallbackError) {
        // If not available, we'll do a basic validation without downloading
        throw new Error('Clarinet CLI not available on Vercel. Using basic validation only.');
      }
    }
  } else if (platform() === 'win32') {
    // On Windows, use the installed path
    return '"C:\\Program Files\\clarinet\\bin\\clarinet.exe"';
  } else {
    // On other platforms, assume clarinet is in PATH
    return 'clarinet';
  }
}

/**
 * Validates a Clarity contract using Clarinet CLI
 * @param contractCode The Clarity contract code to validate
 * @param contractName The name of the contract
 * @returns Validation result with success status and output/errors
 */
export async function validateWithClarinet(contractCode: string, contractName: string): Promise<{
  success: boolean;
  output: string;
  errors?: string;
}> {
  let tempDir: string | null = null;
  let clarinetPath: string | null = null;
  
  try {
    // Setup Clarinet CLI
    clarinetPath = await setupClarinetCLI();
    
    // Create a temporary directory for validation
    tempDir = join(tmpdir(), `clarinet-validation-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await mkdir(tempDir, { recursive: true });
    
    // Create a basic Clarinet.toml file
    const clarinetToml = `[project]
name = "validation-project"
authors = ["stella-ai"]
telemetry = false
cache_dir = ".cache"

[contracts]
${contractName} = { path = "contracts/${contractName}.clar" }
`;
    
    // Write Clarinet.toml
    await writeFile(join(tempDir, 'Clarinet.toml'), clarinetToml);
    
    // Create contracts directory
    const contractsDir = join(tempDir, 'contracts');
    await mkdir(contractsDir, { recursive: true });
    
    // Write the contract file
    await writeFile(join(contractsDir, `${contractName}.clar`), contractCode);
    
    // Run clarinet check command
    try {
      const { stdout, stderr } = await execPromise(`${clarinetPath} check`, { 
        cwd: tempDir,
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      // If we get here, validation succeeded
      return {
        success: true,
        output: stdout || 'Contract validation successful!',
        errors: stderr || undefined
      };
    } catch (error: any) {
      // Validation failed
      return {
        success: false,
        output: '',
        errors: error.stdout || error.stderr || error.message
      };
    }
  } catch (error: any) {
    // If we can't setup Clarinet CLI, return a specific error message
    return {
      success: false,
      output: '',
      errors: `Validation failed: ${error.message}. This may be due to Clarinet CLI not being available in this environment.`
    };
  } finally {
    // Clean up temporary directories
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Validates a Clarity contract using Clarinet CLI in a specific directory
 * @param projectPath Path to the project directory containing Clarinet.toml
 * @returns Validation result with success status and output/errors
 */
export async function validateProjectWithClarinet(projectPath: string): Promise<{
  success: boolean;
  output: string;
  errors?: string;
}> {
  try {
    // Setup Clarinet CLI
    const clarinetPath = await setupClarinetCLI();
    
    // Run clarinet check command
    try {
      const { stdout, stderr } = await execPromise(`${clarinetPath} check`, { 
        cwd: projectPath,
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      // If we get here, validation succeeded
      return {
        success: true,
        output: stdout || 'Contract validation successful!',
        errors: stderr || undefined
      };
    } catch (error: any) {
      // Validation failed
      return {
        success: false,
        output: '',
        errors: error.stdout || error.stderr || error.message
      };
    }
  } catch (error: any) {
    // If we can't setup Clarinet CLI, return a specific error message
    return {
      success: false,
      output: '',
      errors: `Validation failed: ${error.message}. This may be due to Clarinet CLI not being available in this environment.`
    };
  }
}

/**
 * Checks if Clarinet CLI is installed or can be setup
 * @returns Boolean indicating if Clarinet is available
 */
export async function isClarinetInstalled(): Promise<boolean> {
  try {
    const clarinetPath = await setupClarinetCLI();
    await execPromise(`${clarinetPath} --version`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}