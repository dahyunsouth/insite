import { successResponse } from "../../../_mock/helpers";

export async function POST() {
  return successResponse(null, "인증이 완료되었습니다.");
}
