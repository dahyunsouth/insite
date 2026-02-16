import { successResponse } from "../../../_mock/helpers";

export async function POST() {
  return successResponse(null, "인증 코드가 발송되었습니다.");
}
