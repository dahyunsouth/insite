import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../_mock/helpers";
import { findUserByEmail } from "../../../_mock/store";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return errorResponse("Missing email parameter");

  if (findUserByEmail(email)) {
    return errorResponse("이미 사용 중인 이메일입니다.", 409);
  }
  return successResponse(null, "사용 가능한 이메일입니다.");
}
