import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { writeFile, mkdir, rm, access, constants } from 'fs/promises';
import { tmpdir } from 'os';
import { platform } from 'process';
import { existsSync } from 'fs';

const execPromise = promisify(exec);

// Function to download and setup Clarinet CLI on Vercel
async function setupClarinetCLI(): Promise<string> {
  const isVercel = !!process.env.VERCEL;
  const tempDir = join(tmpdir(), 'clarinet-setup');
  
  if (isVercel) {
    // On Vercel, download and extract Clarinet CLI
    try {
      // Create temp directory
      await mkdir(tempDir, { recursive: true });
      
      // Download Clarinet CLI for Linux (Vercel uses Linux)
      const downloadCommand = `curl -L https://github.com/hirosystems/clarinet/releases/download/v3.8.0/clarinet-linux-x64.gz -o ${join(tempDir, 'clarinet.gz')}`;
      await execPromise(downloadCommand, { timeout: 30000 });
      
      // Extract the gz file
      await execPromise(`gunzip ${join(tempDir, 'clarinet.gz')}`, { timeout: 30000 });
      
      // Make it executable
      const clarinetPath = join(tempDir, 'clarinet');
      await execPromise(`chmod +x ${clarinetPath}`, { timeout: 5000 });
      
      return clarinetPath;
    } catch (error) {
      throw new Error(`Failed to setup Clarinet CLI on Vercel: ${error}`);
    }
  } else if (platform === 'win32') {
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
    return {
      success: false,
      output: '',
      errors: `Validation failed: ${error.message}`
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
    
    // Check if Clarinet.toml exists in the project directory
    try {
      await access(join(projectPath, 'Clarinet.toml'), constants.F_OK);
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: 'Clarinet.toml not found in the project directory.'
      };
    }
    
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
    return {
      success: false,
      output: '',
      errors: `Validation failed: ${error.message}`
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