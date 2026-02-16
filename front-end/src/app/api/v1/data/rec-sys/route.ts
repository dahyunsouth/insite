import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../_mock/helpers";
import { generateRecommendations } from "../../_mock/generators";

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get("district");
  const type = req.nextUrl.searchParams.get("type");
  if (!district || !type) return errorResponse("Missing district or type");
  return successResponse(generateRecommendations(district, type));
}
