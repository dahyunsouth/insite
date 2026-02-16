import { NextRequest } from "next/server";
import { successResponse, errorResponse, parseToken } from "../../_mock/helpers";
import { findUserByUuid, updateUser, deleteUser } from "../../_mock/store";

function getUserFromRequest(req: NextRequest) {
  const payload = parseToken(req.headers.get("Authorization"));
  if (!payload?.uuid) return null;
  return findUserByUuid(payload.uuid as string);
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return errorResponse("인증이 필요합니다.", 403);

  return successResponse({
    uuid: user.uuid,
    email: user.email,
    nickname: user.nickname,
    profile: user.profile,
    provider: user.provider,
    type: user.type,
  });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return errorResponse("인증이 필요합니다.", 403);

  try {
    const body = await req.json();
    const updated = updateUser(user.uuid, {
      ...(body.nickname && { nickname: body.nickname }),
      ...(body.password && { password: body.password }),
      ...(body.profile && { profile: body.profile }),
    });
    if (!updated) return errorResponse("사용자를 찾을 수 없습니다.", 404);
    return successResponse(null, "회원정보가 수정되었습니다.");
  } catch {
    return errorResponse("요청 형식이 올바르지 않습니다.", 400);
  }
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return errorResponse("인증이 필요합니다.", 403);

  deleteUser(user.uuid);
  return successResponse(null, "회원탈퇴가 완료되었습니다.");
}
