import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { writeFile, mkdir, rm } from "fs/promises";
import { tmpdir, platform } from "os";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractCode, contractName } = body;

    if (!contractCode || !contractName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Contract code and name are required" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Setup Clarinet CLI
    const clarinetPath = await setupClarinetCLI();
    
    // If CLI is not available, return failure
    if (!clarinetPath) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Clarinet CLI not available" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
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
      await writeFile(join(tempDir, "Clarinet.toml"), clarinetToml);

      // Create contracts directory
      const contractsDir = join(tempDir, "contracts");
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

        return new Response(
          JSON.stringify({
            success: true,
            output: stdout || "Contract validation successful!",
            errors: stderr || undefined
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error: any) {
        // Validation failed - handle both JSON and text responses
        let errorData = error.stdout || error.stderr || error.message;
        
        // Try to parse as JSON if it looks like JSON
        if (typeof errorData === 'string' && errorData.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(errorData);
            errorData = parsed.error || parsed.message || errorData;
          } catch (jsonError) {
            // If JSON parsing fails, keep as text
          }
        }

        return new Response(
          JSON.stringify({
            success: false,
            output: "",
            errors: errorData
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } finally {
      // Clean up temporary directories
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("Failed to cleanup temporary directory:", cleanupError);
      }
    }
  } catch (error: any) {
    console.error("Validation service error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Clarity validation service is running" 
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}