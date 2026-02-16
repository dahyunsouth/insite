import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../_mock/helpers";
import { generateAiSummary } from "../../../_mock/generators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trdarCd: string }> }
) {
  const { trdarCd } = await params;
  if (!trdarCd) return errorResponse("Missing trdarCd");
  return successResponse(generateAiSummary(Number(trdarCd)));
}
