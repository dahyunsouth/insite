import { successResponse } from "../../_mock/helpers";

export async function POST() {
  return successResponse(null, "로그아웃 성공");
}
