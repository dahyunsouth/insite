import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../_mock/helpers";
import { findUserByNickname } from "../../../_mock/store";

export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get("nickname");
  if (!nickname) return errorResponse("Missing nickname parameter");

  if (findUserByNickname(nickname)) {
    return errorResponse("이미 사용 중인 닉네임입니다.", 400);
  }
  return successResponse(null, "사용 가능한 닉네임입니다.");
}
