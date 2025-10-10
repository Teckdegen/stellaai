import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Forward the request to our dedicated validation service
    const body = await req.json();
    
    // Call the dedicated validation service
    const validationResponse = await fetch(
      `${req.nextUrl.origin}/api/validate-clarity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    
    const result = await validationResponse.json();
    return Response.json(result);
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