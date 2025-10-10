import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { writeFile, mkdir, rm, access, constants } from 'fs/promises';
import { tmpdir } from 'os';

const execPromise = promisify(exec);

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
  
  try {
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
    
    // Check if Clarinet CLI is installed
    try {
      await execPromise('clarinet --version', { timeout: 5000 });
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: 'Clarinet CLI not found. Please install it globally with `npm install -g @hirosystems/clarinet`.'
      };
    }
    
    // Run clarinet check command
    try {
      const { stdout, stderr } = await execPromise('clarinet check', { 
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
    // Clean up temporary directory
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
    // Check if Clarinet CLI is installed
    try {
      await execPromise('clarinet --version', { timeout: 5000 });
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: 'Clarinet CLI not found. Please install it globally with `npm install -g @hirosystems/clarinet`.'
      };
    }
    
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
      const { stdout, stderr } = await execPromise('clarinet check', { 
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
 * Checks if Clarinet CLI is installed
 * @returns Boolean indicating if Clarinet is installed
 */
export async function isClarinetInstalled(): Promise<boolean> {
  try {
    await execPromise('clarinet --version', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}