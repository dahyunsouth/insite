import { NextRequest } from "next/server";
import { successResponse, errorResponse, createToken, parseToken } from "../../_mock/helpers";
import { findUserByUuid } from "../../_mock/store";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    const payload = parseToken(`Bearer ${refreshToken}`);

    if (!payload?.uuid) {
      return errorResponse("유효하지 않은 리프레시 토큰입니다.", 401);
    }

    const user = findUserByUuid(payload.uuid as string);
    const newToken = createToken({
      uuid: payload.uuid,
      email: payload.email,
      nickname: user?.nickname,
      profile: user?.profile,
      provider: user?.provider,
      type: user?.type,
    });

    return successResponse({ accessToken: newToken });
  } catch {
    return errorResponse("토큰 갱신에 실패했습니다.", 401);
  }
}
