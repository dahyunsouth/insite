import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../_mock/helpers";
import { generateChngeIx } from "../../../_mock/generators";

export async function GET(req: NextRequest) {
  const trdarCd = req.nextUrl.searchParams.get("trdarCd");
  if (!trdarCd) return errorResponse("Missing trdarCd");
  return successResponse(generateChngeIx(Number(trdarCd)));
}
