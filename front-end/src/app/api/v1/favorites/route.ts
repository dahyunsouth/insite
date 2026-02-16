import { NextRequest } from "next/server";
import { successResponse, errorResponse, parseToken } from "../_mock/helpers";
import { getFavorites, addFavorite } from "../_mock/store";

function getUuid(req: NextRequest): string | null {
  const payload = parseToken(req.headers.get("Authorization"));
  return (payload?.uuid as string) ?? null;
}

export async function GET(req: NextRequest) {
  const uuid = getUuid(req);
  if (!uuid) return errorResponse("인증이 필요합니다.", 403);
  return successResponse({ favorites: getFavorites(uuid) });
}

export async function POST(req: NextRequest) {
  const uuid = getUuid(req);
  if (!uuid) return errorResponse("인증이 필요합니다.", 403);

  const trdarCd = req.nextUrl.searchParams.get("trdarCd");
  if (!trdarCd) return errorResponse("Missing trdarCd");

  addFavorite(uuid, Number(trdarCd));
  return successResponse(null, "즐겨찾기에 추가되었습니다.");
}
