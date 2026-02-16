import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../_mock/helpers";
import { generateScore } from "../../_mock/generators";

export async function GET(req: NextRequest) {
  const trdarCdNm = req.nextUrl.searchParams.get("trdarCdNm");
  if (!trdarCdNm) return errorResponse("Missing trdarCdNm");
  return successResponse(generateScore(trdarCdNm));
}
