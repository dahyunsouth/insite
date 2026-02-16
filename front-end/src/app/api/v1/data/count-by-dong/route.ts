import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../_mock/helpers";
import { countByDong } from "../../_mock/generators";

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get("district");
  const dong = req.nextUrl.searchParams.get("dong");
  if (!district || !dong) return errorResponse("Missing district or dong");
  return successResponse({ count: countByDong(district, dong) });
}
