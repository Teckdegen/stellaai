import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { writeFile, mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { platform } from "os";

const execPromise = promisify(exec);

// Function to setup Clarinet CLI
async function setupClarinetCLI(): Promise<string | null> {
  const isVercel = !!process.env.VERCEL;
  
  if (isVercel) {
    // On Vercel, use the installed Clarinet binary
    try {
      const clarinetDir = join(process.env.VERCEL_BUILD_DIR || '/vercel/path0', 'clarinet-bin');
      const clarinetPath = join(clarinetDir, 'clarinet');
      
      // Test if it actually works
      await execPromise(`${clarinetPath} --version`, { timeout: 5000 });
      
      return clarinetPath;
    } catch (error) {
      console.error('[Validation API] Clarinet not found in Vercel environment:', error);
      return null;
    }
  } else {
    // On local development, assume clarinet is in PATH
    try {
      await execPromise('clarinet --version', { timeout: 5000 });
      return 'clarinet';
    } catch (error) {
      console.error('[Validation API] Clarinet not found in PATH:', error);
      return null;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractCode, contractName } = body;

    if (!contractCode || !contractName) {
      return Response.json(
        { 
          success: false, 
          errors: ["Contract code and name are required"] 
        },
        { status: 400 }
      );
    }

    // Setup Clarinet CLI
    const clarinetPath = await setupClarinetCLI();
    
    // If CLI is not available, return failure
    if (!clarinetPath) {
      return Response.json(
        { 
          success: false, 
          errors: ["Clarinet CLI not available. Please ensure it's installed and accessible."] 
        },
        { status: 500 }
      );
    }

    // Create a temporary directory for validation
    const tempDir = join(tmpdir(), `clarity-validation-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await mkdir(tempDir, { recursive: true });

    try {
      // Create a basic Clarinet.toml file
      const clarinetToml = `[project]
name = "validation-project"
authors = ["clarity-ide"]
telemetry = false
cache_dir = ".cache"

[contracts]
${contractName} = { path = "contracts/${contractName}.clar" }
`;

      // Write Clarinet.toml
      const tomlPath = join(tempDir, "Clarinet.toml");
      await writeFile(tomlPath, clarinetToml);

      // Create contracts directory
      const contractsDir = join(tempDir, "contracts");
      await mkdir(contractsDir, { recursive: true });

      // Write the contract file
      const contractPath = join(contractsDir, `${contractName}.clar`);
      await writeFile(contractPath, contractCode);

      // Run clarinet check command
      try {
        const { stdout, stderr } = await execPromise(`${clarinetPath} check`, {
          cwd: tempDir,
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024 // 1MB buffer
        });

        // Parse output to extract errors
        const errors: Array<{ line: number; message: string }> = [];
        
        // Always parse output to extract all errors/warnings, even if validation passes
        const output = stderr || stdout;
        if (output) {
          const lines = output.split('\n');
          
          for (const line of lines) {
            // Skip empty lines
            if (!line.trim()) continue;
            
            // Look for error patterns in Clarinet output
            if (line.includes("error:") || line.includes("Error:") || line.includes("failed:") || line.includes("Error")) {
              // Extract file, line, and column information from Clarinet output
              // Pattern: file:line:column: error: message
              const locationMatch = line.match(/[^:]+:(\d+):(\d+):\s*(.*)/);
              if (locationMatch) {
                const lineNum = parseInt(locationMatch[1]) || 1;
                const message = locationMatch[3] ? locationMatch[3].trim() : line.trim();
                errors.push({ line: lineNum, message });
              } else {
                // Fallback: try to extract line number from any number in the line
                const lineMatch = line.match(/(\d+)/);
                const lineNum = lineMatch ? parseInt(lineMatch[1]) : 1;
                errors.push({ line: lineNum, message: line.trim() });
              }
            }
            // Also capture warnings
            else if (line.includes("warning:") || line.includes("Warning:")) {
              const locationMatch = line.match(/[^:]+:(\d+):(\d+):\s*(.*)/);
              if (locationMatch) {
                const lineNum = parseInt(locationMatch[1]) || 1;
                const message = locationMatch[3] ? locationMatch[3].trim() : line.trim();
                errors.push({ line: lineNum, message: `Warning: ${message}` });
              } else {
                const lineMatch = line.match(/(\d+)/);
                const lineNum = lineMatch ? parseInt(lineMatch[1]) : 1;
                errors.push({ line: lineNum, message: `Warning: ${line.trim()}` });
              }
            }
          }
          
          // If no structured errors found but there's output, add it as a general message
          if (errors.length === 0 && output.trim()) {
            errors.push({ line: 1, message: output.trim() });
          }
        }

        // Consider validation successful if there are no errors in stderr
        const success = !stderr || stderr.trim() === "";

        return Response.json({
          success: success,
          errors: errors,
          output: stdout || "Contract validation completed"
        });
      } catch (error: any) {
        // Validation failed - parse errors
        const errors: Array<{ line: number; message: string }> = [];
        const output = error.stdout || error.stderr || error.message;
        
        if (output) {
          const lines = output.split('\n');
          for (const line of lines) {
            // Skip empty lines
            if (!line.trim()) continue;
            
            // Look for error patterns in Clarinet output
            if (line.includes("error:") || line.includes("Error:") || line.includes("failed:") || line.includes("Error")) {
              // Extract file, line, and column information from Clarinet output
              // Pattern: file:line:column: error: message
              const locationMatch = line.match(/[^:]+:(\d+):(\d+):\s*(.*)/);
              if (locationMatch) {
                const lineNum = parseInt(locationMatch[1]) || 1;
                const message = locationMatch[3] ? locationMatch[3].trim() : line.trim();
                errors.push({ line: lineNum, message });
              } else {
                // Fallback: try to extract line number from any number in the line
                const lineMatch = line.match(/(\d+)/);
                const lineNum = lineMatch ? parseInt(lineMatch[1]) : 1;
                errors.push({ line: lineNum, message: line.trim() });
              }
            }
            // Also capture warnings
            else if (line.includes("warning:") || line.includes("Warning:")) {
              const locationMatch = line.match(/[^:]+:(\d+):(\d+):\s*(.*)/);
              if (locationMatch) {
                const lineNum = parseInt(locationMatch[1]) || 1;
                const message = locationMatch[3] ? locationMatch[3].trim() : line.trim();
                errors.push({ line: lineNum, message: `Warning: ${message}` });
              } else {
                const lineMatch = line.match(/(\d+)/);
                const lineNum = lineMatch ? parseInt(lineMatch[1]) : 1;
                errors.push({ line: lineNum, message: `Warning: ${line.trim()}` });
              }
            }
          }
          
          // If no structured errors found, add the whole output as one error
          if (errors.length === 0) {
            errors.push({ line: 1, message: output });
          }
        } else {
          errors.push({ line: 1, message: "Unknown validation error" });
        }

        return Response.json({
          success: false,
          errors: errors,
          output: ""
        });
      }
    } finally {
      // Clean up temporary directories
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("[Validation API] Failed to cleanup temporary directory:", cleanupError);
      }
    }
  } catch (error: any) {
    console.error("[Validation API] Error:", error);
    return Response.json(
      { 
        success: false, 
        errors: [error.message || "Internal server error"] 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return Response.json({ success: true, message: "Validation API is running" });
}