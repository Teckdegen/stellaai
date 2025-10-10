import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir, platform } from 'os';

// Try to import Clarinet SDK (may not be available in all environments)
let clarinetSDK: any = null;
try {
  clarinetSDK = require('@hirosystems/clarinet-sdk');
} catch (error) {
  console.log('Clarinet SDK not available, will use CLI or API fallback');
}

const execPromise = promisify(exec);

// Function to setup Clarinet CLI
async function setupClarinetCLI(): Promise<string | null> {
  const isVercel = !!process.env.VERCEL;
  
  if (isVercel) {
    // On Vercel, check if Clarinet CLI was installed in the build process
    try {
      // Check if clarinet is available in the custom path
      const clarinetDir = join(process.env.VERCEL_BUILD_DIR || '/vercel/path0', 'clarinet-bin');
      const clarinetPath = join(clarinetDir, 'clarinet');
      
      // Test if the file exists and is executable
      await execPromise(`test -f ${clarinetPath} && chmod +x ${clarinetPath}`, { timeout: 5000 });
      
      // Test if it actually works
      await execPromise(`${clarinetPath} --version`, { timeout: 5000 });
      
      return clarinetPath;
    } catch (error) {
      // Try to use system clarinet
      try {
        await execPromise('which clarinet', { timeout: 5000 });
        return 'clarinet';
      } catch (fallbackError) {
        // If not available, return null to indicate CLI is not available
        return null;
      }
    }
  } else if (platform() === 'win32') {
    // On Windows, use the installed path
    try {
      const clarinetPath = '"C:\\Program Files\\clarinet\\bin\\clarinet.exe"';
      await execPromise(`${clarinetPath} --version`, { timeout: 5000 });
      return clarinetPath;
    } catch (error) {
      return null;
    }
  } else {
    // On other platforms, assume clarinet is in PATH
    try {
      await execPromise('clarinet --version', { timeout: 5000 });
      return 'clarinet';
    } catch (error) {
      return null;
    }
  }
}

// Validate using Clarinet SDK
async function validateWithSDK(contractCode: string, contractName: string): Promise<{
  success: boolean;
  output: string;
  errors?: string;
}> {
  if (!clarinetSDK) {
    return {
      success: false,
      output: '',
      errors: 'Clarinet SDK not available'
    };
  }

  try {
    // Use the SDK to validate the contract
    const result = await clarinetSDK.validateContract(contractCode);
    
    if (result.valid) {
      return {
        success: true,
        output: 'Contract validation successful via SDK!',
        errors: undefined
      };
    } else {
      return {
        success: false,
        output: '',
        errors: result.errors?.join('\n') || 'Validation failed via SDK'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      errors: `SDK validation failed: ${error.message}`
    };
  }
}

// Validate using Clarinet CLI
async function validateWithCLI(contractCode: string, contractName: string): Promise<{
  success: boolean;
  output: string;
  errors?: string;
}> {
  let tempDir: string | null = null;
  let clarinetPath: string | null = null;
  
  try {
    // Setup Clarinet CLI
    clarinetPath = await setupClarinetCLI();
    
    // If CLI is not available, return failure
    if (!clarinetPath) {
      return {
        success: false,
        output: '',
        errors: 'Clarinet CLI not available'
      };
    }
    
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
        output: stdout || 'Contract validation successful via CLI!',
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
      errors: `CLI validation failed: ${error.message}`
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

// Validate using Hiro Online API as fallback
async function validateWithHiroAPI(contractCode: string): Promise<{
  success: boolean;
  output: string;
  errors?: string;
}> {
  try {
    const response = await fetch('https://api.testnet.hiro.so/v2/contracts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contract_source: contractCode,
      }),
    });

    const result = await response.json();

    if (result.result === 'success') {
      return {
        success: true,
        output: 'Contract validation successful via Hiro API!',
        errors: undefined
      };
    } else {
      return {
        success: false,
        output: '',
        errors: result.error || 'Validation failed via Hiro API'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      errors: `Hiro API validation failed: ${error.message}`
    };
  }
}

/**
 * Validates a Clarity contract using the best available method
 * @param contractCode The Clarity contract code to validate
 * @param contractName The name of the contract
 * @returns Validation result with success status and output/errors
 */
export async function validateWithClarinet(contractCode: string, contractName: string): Promise<{
  success: boolean;
  output: string;
  errors?: string;
}> {
  console.log('Starting validation with priority: SDK > CLI > API');
  
  // 1. Try SDK first (if available)
  if (clarinetSDK) {
    console.log('Attempting validation with Clarinet SDK');
    const sdkResult = await validateWithSDK(contractCode, contractName);
    if (sdkResult.success || sdkResult.errors !== 'Clarinet SDK not available') {
      console.log('SDK validation result:', sdkResult.success ? 'success' : 'failure');
      return sdkResult;
    }
  }
  
  // 2. Try CLI second
  console.log('Attempting validation with Clarinet CLI');
  const cliResult = await validateWithCLI(contractCode, contractName);
  if (cliResult.success || cliResult.errors !== 'Clarinet CLI not available') {
    console.log('CLI validation result:', cliResult.success ? 'success' : 'failure');
    return cliResult;
  }
  
  // 3. Fallback to Hiro API
  console.log('Attempting validation with Hiro API');
  const apiResult = await validateWithHiroAPI(contractCode);
  console.log('API validation result:', apiResult.success ? 'success' : 'failure');
  return apiResult;
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
    
    // If CLI is not available, return failure
    if (!clarinetPath) {
      return {
        success: false,
        output: '',
        errors: 'Clarinet CLI not available'
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
    // If we can't setup Clarinet CLI, return a specific error message
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
    return !!clarinetPath;
  } catch (error) {
    return false;
  }
}