import { NextRequest } from "next/server";
import { successResponse, errorResponse, parseToken } from "../../_mock/helpers";
import { removeFavorite } from "../../_mock/store";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ trdarCd: string }> }
) {
  const payload = parseToken(req.headers.get("Authorization"));
  const uuid = payload?.uuid as string;
  if (!uuid) return errorResponse("인증이 필요합니다.", 403);

  const { trdarCd } = await params;
  removeFavorite(uuid, Number(trdarCd));
  return successResponse(null, "즐겨찾기에서 삭제되었습니다.");
}
