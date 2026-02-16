import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../_mock/helpers";
import { getTradeAreas } from "../../_mock/generators";

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get("district");
  const dong = req.nextUrl.searchParams.get("dong");
  if (!district || !dong) return errorResponse("Missing district or dong");

  const rows = getTradeAreas(district, dong);
  return successResponse({
    districtNameKor: district,
    dongNameKor: dong,
    areas: rows.map((r) => ({
      trdarSeCd: r.trdar_se_cd,
      trdarSeCdNm: r.trdar_se_cd_nm,
      trdarCd: Number(r.trdar_cd),
      trdarCdNm: r.trdar_cd_nm,
      xcntsValue: r.xcnts_value,
      ydntsValue: r.ydnts_value,
      relmAr: r.relm_ar,
      storCo: 50 + (Number(r.trdar_cd) % 200),
      similrIndutyStorCo: 10 + (Number(r.trdar_cd) % 50),
    })),
  });
}
