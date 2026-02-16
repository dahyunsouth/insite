// 상권 목록 조회 헬퍼

import TradeAreaRaw from "@/data/TradeAreaValue.json";
import SignGuRaw from "@/data/SignGuValue.json";

export type TradeAreaRow = (typeof TradeAreaRaw.DATA)[number];

export { TradeAreaRaw };

export function getGuList(): string[] {
  return SignGuRaw.DATA.map((d) => d.signgu_nm);
}

export function getDongList(district: string): string[] {
  const dongs = new Set<string>();
  for (const row of TradeAreaRaw.DATA) {
    if (row.signgu_cd_nm === district) dongs.add(row.adstrd_cd_nm);
  }
  return [...dongs].sort();
}

export function getTradeAreas(district: string, dong: string) {
  return TradeAreaRaw.DATA.filter(
    (r) =>
      r.signgu_cd_nm === district &&
      (r.adstrd_cd_nm === dong || r.adstrd_cd_nm.replace(/[·.ㆍ]/g, "?") === dong)
  );
}

export function findTradeArea(trdarCd: number | string): TradeAreaRow | undefined {
  return TradeAreaRaw.DATA.find((r) => String(r.trdar_cd) === String(trdarCd));
}

export function countByGu(district: string): number {
  return TradeAreaRaw.DATA.filter((r) => r.signgu_cd_nm === district).length;
}

export function countByDong(district: string, dong: string): number {
  return getTradeAreas(district, dong).length;
}
