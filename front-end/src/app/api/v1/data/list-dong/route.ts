import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../_mock/helpers";
import { getDongList } from "../../_mock/generators";

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get("district");
  if (!district) return errorResponse("Missing district parameter");
  return successResponse(getDongList(district));
}
