// 상세/점수/추천/AI 요약 데이터 생성

import { hash, randInt, pick, QUARTER } from "./seed";
import { findTradeArea, TradeAreaRaw } from "./trade-areas";

// --- 상권 상세 ---

export function generateTradeAreaDetail(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const name = row?.trdar_cd_nm ?? `상권${trdarCd}`;

  return {
    trdarCd,
    trdarCdNm: name,
    chnge: {
      stdrYyquCd: QUARTER,
      trdrChngeIx: pick(s, ["LL", "LH", "HL", "HH"], 1),
    },
    sales: {
      stdrYyquCd: QUARTER,
      thsmonSelngAmt: randInt(s, 30000000, 500000000, 10),
      thsmonSelngCo: randInt(s, 1000, 50000, 11),
      mdwkSelngAmt: randInt(s, 20000000, 350000000, 12),
      wkendSelngAmt: randInt(s, 10000000, 150000000, 13),
      mdwkSelngCo: randInt(s, 700, 35000, 14),
      wkendSelngCo: randInt(s, 300, 15000, 15),
    },
    stor: {
      stdrYyquCd: QUARTER,
      storCo: randInt(s, 20, 500, 20),
      frcStorCo: randInt(s, 5, 100, 21),
      opbizRt: randInt(s, 5, 30, 22),
      opbizStorCo: randInt(s, 1, 50, 23),
      clsbizRt: randInt(s, 3, 20, 24),
      clsbizStorCo: randInt(s, 1, 30, 25),
    },
    flpop: {
      stdrYyquCd: Number(QUARTER),
      totFlpopCo: randInt(s, 5000, 500000, 30),
    },
    repop: {
      stdrYyquCd: QUARTER,
      totRepopCo: randInt(s, 1000, 100000, 40),
    },
    wrc: {
      stdrYyquCd: QUARTER,
      totWrcPopltnCo: randInt(s, 500, 80000, 50),
    },
  };
}

// --- score ---

export function generateScore(trdarCdNm: string) {
  const row = TradeAreaRaw.DATA.find((r) => r.trdar_cd_nm === trdarCdNm);
  const s = row ? Number(row.trdar_cd) : trdarCdNm.length * 12345;

  return {
    district: row?.signgu_cd_nm ?? "종로구",
    dong: row?.adstrd_cd_nm ?? "종로1·2·3·4가동",
    areaName: trdarCdNm,
    areaType: row?.trdar_se_cd_nm ?? "골목상권",
    totalScore: randInt(s, 40, 95, 500),
    sustainabilityScore: randInt(s, 30, 100, 501),
    profitabilityScore: randInt(s, 30, 100, 502),
    accessibilityScore: randInt(s, 30, 100, 503),
    riskScore: randInt(s, 30, 100, 504),
    competitionScore: randInt(s, 30, 100, 505),
  };
}

// --- rec-sys ---

export function generateRecommendations(district: string, areaType: string) {
  const typeCd = areaType === "발달" ? "D" : "A";
  const filtered = TradeAreaRaw.DATA.filter(
    (r) => r.signgu_cd_nm === district && r.trdar_se_cd === typeCd
  ).slice(0, 10);

  return {
    district,
    areaType,
    items: filtered.map((r, i) => {
      const s = Number(r.trdar_cd);
      return {
        ranking: i + 1,
        areaName: r.trdar_cd_nm,
        totalScore: randInt(s, 50, 95, 500),
        sustainabilityScore: randInt(s, 30, 100, 501),
        profitabilityScore: randInt(s, 30, 100, 502),
        accessibilityScore: randInt(s, 30, 100, 503),
        riskScore: randInt(s, 30, 100, 504),
        competitionScore: randInt(s, 30, 100, 505),
        trdarCode: String(r.trdar_cd),
        coordinates: { lat: r.ydnts_value, lng: r.xcnts_value },
      };
    }),
  };
}

// --- AI 요약 ---

const SUMMARY_TEMPLATES = [
  (name: string, gu: string) =>
    `${gu} ${name} 상권은 유동인구가 풍부하고 주변 인프라가 잘 갖춰져 있어 창업 입지로서 높은 잠재력을 보유하고 있습니다. 특히 점심 시간대 직장인 수요가 강하며, 주말에도 꾸준한 매출이 발생하는 특징이 있습니다.`,
  (name: string, gu: string) =>
    `${gu} ${name} 상권은 주거 밀집 지역으로 상주인구 기반의 안정적인 소비 패턴을 보입니다. 프랜차이즈 비율이 낮아 독립 점포의 경쟁력이 높은 편이며, 저녁 시간대 매출 비중이 큰 특징이 있습니다.`,
  (name: string, gu: string) =>
    `${gu} ${name} 상권은 교통 접근성이 우수하여 다양한 연령대의 유동인구가 방문합니다. 최근 신규 개업률이 폐업률을 상회하여 상권 확장 추세에 있으며, 20~30대 소비자 비중이 높습니다.`,
  (name: string, gu: string) =>
    `${gu} ${name} 상권은 오피스 밀집 지역으로 직장인구가 많아 평일 매출이 높습니다. 점포 밀도가 적정 수준으로 과당 경쟁 우려가 적으며, 점심·저녁 시간대 매출이 집중되는 패턴을 보입니다.`,
  (name: string, gu: string) =>
    `${gu} ${name} 상권은 관광·문화 시설과 인접해 관광객 유입이 활발합니다. 주말 매출 비중이 상대적으로 높으며, 카페·디저트 업종의 매출이 두드러지는 특화 상권입니다.`,
];

const FEATURE_POOL = [
  "유동인구 풍부",
  "직장인 수요 강세",
  "주말 매출 안정적",
  "교통 접근성 우수",
  "신규 개업률 상승",
  "프랜차이즈 비율 낮음",
  "20~30대 비중 높음",
  "상주인구 기반 안정적",
  "저녁 시간대 매출 집중",
  "점포 밀도 적정",
  "관광객 유입 활발",
  "상권 확장 추세",
];

export function generateAiSummary(trdarCd: number) {
  const row = findTradeArea(trdarCd);
  const name = row?.trdar_cd_nm ?? `상권${trdarCd}`;
  const gu = row?.signgu_cd_nm ?? "서울";
  const s = trdarCd;

  const template = SUMMARY_TEMPLATES[hash(s, 700) % SUMMARY_TEMPLATES.length];
  const featureCount = 3 + (hash(s, 701) % 3);
  const features: string[] = [];
  for (let i = 0; i < featureCount; i++) {
    const f = FEATURE_POOL[hash(s, 710 + i) % FEATURE_POOL.length];
    if (!features.includes(f)) features.push(f);
  }

  return {
    summary: template(name, gu),
    features,
  };
}
