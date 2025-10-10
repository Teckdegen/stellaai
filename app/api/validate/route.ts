import { NextRequest } from "next/server";
import { validateWithClarinet, validateProjectWithClarinet } from "@/lib/clarinet-validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractCode, contractName, projectPath } = body;

    console.log("Validation API called with:", { contractCode: !!contractCode, contractName, projectPath: !!projectPath });

    // Validate either a contract code or a project path
    if (projectPath) {
      // Validate an existing project
      console.log("Validating project at path:", projectPath);
      const result = await validateProjectWithClarinet(projectPath);
      console.log("Project validation result:", result);
      return Response.json(result);
    } else if (contractCode && contractName) {
      // Validate contract code directly
      console.log("Validating contract code for:", contractName);
      const result = await validateWithClarinet(contractCode, contractName);
      console.log("Contract validation result:", result);
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
  // Health check endpoint - always return success for Vercel deployment
  console.log("Validation API health check");
  return Response.json({ success: true, message: "Validation API is running" });
}