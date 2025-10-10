import { NextRequest } from "next/server";
import { validateWithClarinet, validateProjectWithClarinet, isClarinetInstalled } from "@/lib/clarinet-validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractCode, contractName, projectPath } = body;

    // Check if Clarinet is installed
    const isInstalled = await isClarinetInstalled();
    if (!isInstalled) {
      return Response.json({
        success: false,
        output: '',
        errors: 'Clarinet CLI not found. Please install it globally with `npm install -g @hirosystems/clarinet`.'
      });
    }

    // Validate either a contract code or a project path
    if (projectPath) {
      // Validate an existing project
      const result = await validateProjectWithClarinet(projectPath);
      return Response.json(result);
    } else if (contractCode && contractName) {
      // Validate contract code directly
      const result = await validateWithClarinet(contractCode, contractName);
      return Response.json(result);
    } else {
      return Response.json(
        { error: "Either contractCode and contractName or projectPath are required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[v0] Validation API Error:", error);
    return Response.json(
      { 
        success: false,
        output: '',
        errors: "Failed to validate contract: " + (error instanceof Error ? error.message : "Unknown error")
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isInstalled = await isClarinetInstalled();
    return Response.json({ installed: isInstalled });
  } catch (error) {
    return Response.json({ installed: false, error: "Failed to check Clarinet installation" });
  }
}