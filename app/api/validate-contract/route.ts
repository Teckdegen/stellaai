import { NextRequest } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { writeFile, mkdir, rm, stat } from "fs/promises";
import { tmpdir } from "os";
import { existsSync } from "fs";

const execFilePromise = promisify(execFile);

// Function to ensure Clarinet binary is available
async function ensureClarinetBinary(): Promise<string> {
  const projectRoot = process.cwd();
  const binDir = join(projectRoot, 'bin');
  const clarinetPath = join(binDir, 'clarinet');
  
  // Check if binary already exists
  if (existsSync(clarinetPath)) {
    try {
      // Test if it works
      const { stdout } = await execFilePromise(clarinetPath, ['--version'], { timeout: 5000 });
      console.log('[Validation API] Clarinet already available:', stdout.trim());
      return clarinetPath;
    } catch (testError) {
      console.log('[Validation API] Existing binary broken, will download new one');
    }
  }
  
  // Download Clarinet binary for Linux (Vercel environment)
  try {
    console.log('[Validation API] Downloading Clarinet binary...');
    
    // Create bin directory if it doesn't exist
    await mkdir(binDir, { recursive: true });
    
    // Download the binary directly
    const { stdout: curlStdout } = await execFilePromise('curl', [
      '-L', 
      '-o', 
      clarinetPath, 
      'https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-x86_64-unknown-linux-gnu'
    ], { cwd: projectRoot, timeout: 30000 });
    
    console.log('[Validation API] Curl output:', curlStdout);
    
    // Make it executable
    await execFilePromise('chmod', ['+x', clarinetPath], { cwd: projectRoot, timeout: 5000 });
    
    console.log('[Validation API] Clarinet binary downloaded and made executable');
    return clarinetPath;
  } catch (error: any) {
    console.error('[Validation API] Failed to download Clarinet binary:', error);
    throw new Error('Failed to setup Clarinet CLI for validation');
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

    // Ensure Clarinet binary is available
    let clarinetPath: string;
    try {
      clarinetPath = await ensureClarinetBinary();
    } catch (setupError: any) {
      return Response.json(
        { 
          success: false, 
          errors: [`Failed to setup Clarinet CLI: ${setupError.message || String(setupError)}`] 
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

      // Run clarinet check command using execFile for better security
      try {
        const { stdout, stderr } = await execFilePromise(clarinetPath, ['check'], {
          cwd: tempDir,
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024 // 1MB buffer
        });

        // Simple parsing - if there's stderr, consider it a failure
        const hasErrors = stderr && stderr.trim().length > 0;
        
        return Response.json({
          success: !hasErrors,
          errors: hasErrors ? [stderr.trim()] : [],
          output: stdout || "Contract validation completed",
          stderr: stderr || ""
        });
      } catch (error: any) {
        // Command failed - extract errors
        const stderr = error.stderr || error.message || "Unknown validation error";
        
        return Response.json({
          success: false,
          errors: [stderr],
          output: "",
          stderr: stderr
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