// info/ 라우트용 데이터 생성 (sales, stor, chnge-ix, flpop, repop, wrc-popltn)

import { hash, randInt, pick, QUARTER } from "./seed";
import { findTradeArea } from "./trade-areas";

// --- info/sales ---

export function generateSalesInfo(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const total = randInt(s, 30000000, 500000000, 10);
  const mdwk = Math.round(total * 0.65);
  const wkend = total - mdwk;

  return {
    stdrYyquCd: QUARTER,
    trdarSeCd: row?.trdar_se_cd ?? "A",
    trdarSeCdNm: row?.trdar_se_cd_nm ?? "골목상권",
    trdarCd,
    trdarCdNm: row?.trdar_cd_nm ?? `상권${trdarCd}`,
    svcIndutyCd: "CS100001",
    svcIndutyCdNm: "한식음식점",
    thsmonSelngAmt: total,
    mdwkSelngAmt: mdwk,
    wkendSelngAmt: wkend,
    monSelngAmt: randInt(s, total * 0.1, total * 0.2, 100),
    tuesSelngAmt: randInt(s, total * 0.1, total * 0.2, 101),
    wedSelngAmt: randInt(s, total * 0.1, total * 0.2, 102),
    thurSelngAmt: randInt(s, total * 0.1, total * 0.2, 103),
    friSelngAmt: randInt(s, total * 0.12, total * 0.22, 104),
    satSelngAmt: randInt(s, total * 0.1, total * 0.2, 105),
    sunSelngAmt: randInt(s, total * 0.08, total * 0.15, 106),
    tmzon0006SelngAmt: randInt(s, total * 0.02, total * 0.05, 110),
    tmzon0611SelngAmt: randInt(s, total * 0.1, total * 0.2, 111),
    tmzon1114SelngAmt: randInt(s, total * 0.2, total * 0.3, 112),
    tmzon1417SelngAmt: randInt(s, total * 0.15, total * 0.25, 113),
    tmzon1721SelngAmt: randInt(s, total * 0.2, total * 0.3, 114),
    tmzon2124SelngAmt: randInt(s, total * 0.05, total * 0.1, 115),
    mlSelngAmt: Math.round(total * 0.55),
    fmlSelngAmt: Math.round(total * 0.45),
    agrde10SelngAmt: randInt(s, total * 0.03, total * 0.08, 120),
    agrde20SelngAmt: randInt(s, total * 0.15, total * 0.25, 121),
    agrde30SelngAmt: randInt(s, total * 0.2, total * 0.3, 122),
    agrde40SelngAmt: randInt(s, total * 0.2, total * 0.28, 123),
    agrde50SelngAmt: randInt(s, total * 0.12, total * 0.2, 124),
    agrde60AboveSelngAmt: randInt(s, total * 0.05, total * 0.1, 125),
    // 건수
    thsmonSelngCo: randInt(s, 1000, 50000, 200),
    mdwkSelngCo: randInt(s, 700, 35000, 201),
    wkendSelngCo: randInt(s, 300, 15000, 202),
    monSelngCo: randInt(s, 100, 8000, 210),
    tuesSelngCo: randInt(s, 100, 8000, 211),
    wedSelngCo: randInt(s, 100, 8000, 212),
    thurSelngCo: randInt(s, 100, 8000, 213),
    friSelngCo: randInt(s, 120, 9000, 214),
    satSelngCo: randInt(s, 100, 8000, 215),
    sunSelngCo: randInt(s, 80, 6000, 216),
    tmzon0006SelngCo: randInt(s, 10, 500, 220),
    tmzon0611SelngCo: randInt(s, 100, 5000, 221),
    tmzon1114SelngCo: randInt(s, 200, 10000, 222),
    tmzon1417SelngCo: randInt(s, 150, 8000, 223),
    tmzon1721SelngCo: randInt(s, 200, 10000, 224),
    tmzon2124SelngCo: randInt(s, 50, 3000, 225),
    mlSelngCo: randInt(s, 500, 25000, 230),
    fmlSelngCo: randInt(s, 500, 25000, 231),
    agrde10SelngCo: randInt(s, 30, 3000, 240),
    agrde20SelngCo: randInt(s, 150, 12000, 241),
    agrde30SelngCo: randInt(s, 200, 13000, 242),
    agrde40SelngCo: randInt(s, 200, 12000, 243),
    agrde50SelngCo: randInt(s, 100, 8000, 244),
    agrde60AboveSelngCo: randInt(s, 50, 5000, 245),
  };
}

// --- info/stor ---

export function generateStorInfo(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const storCo = randInt(s, 20, 500, 20);
  const opbizStorCo = randInt(s, 1, Math.max(2, Math.round(storCo * 0.15)), 23);
  const clsbizStorCo = randInt(s, 1, Math.max(2, Math.round(storCo * 0.1)), 25);

  return {
    stdrYyquCd: QUARTER,
    trdarSeCd: row?.trdar_se_cd ?? "A",
    trdarSeCdNm: row?.trdar_se_cd_nm ?? "골목상권",
    trdarCd,
    trdarCdNm: row?.trdar_cd_nm ?? `상권${trdarCd}`,
    storCo,
    similrIndutyStorCo: randInt(s, 5, Math.max(6, Math.round(storCo * 0.3)), 26),
    opbizRt: Number(((opbizStorCo / storCo) * 100).toFixed(1)),
    opbizStorCo,
    clsbizRt: Number(((clsbizStorCo / storCo) * 100).toFixed(1)),
    clsbizStorCo,
    frcStorCo: randInt(s, 5, 100, 21),
    netIncrease: opbizStorCo - clsbizStorCo,
  };
}

// --- info/chnge-ix ---

const CHNGE_MAP: Record<string, string> = {
  LL: "다이나믹",
  LH: "상권 확장",
  HL: "상권 축소",
  HH: "정체",
};

export function generateChngeIx(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const ix = pick(s, ["LL", "LH", "HL", "HH"], 1);

  return {
    stdrYyquCd: QUARTER,
    trdarSeCd: row?.trdar_se_cd ?? "A",
    trdarSeCdNm: row?.trdar_se_cd_nm ?? "골목상권",
    trdarCd,
    trdarCdNm: row?.trdar_cd_nm ?? `상권${trdarCd}`,
    trdarChngeIx: ix,
    trdarChngeIxNm: CHNGE_MAP[ix],
    oprSaleMtAvrg: randInt(s, 6, 36, 60),
    clsSaleMtAvrg: randInt(s, 6, 24, 61),
    suOprSaleMtAvrg: randInt(s, 6, 36, 62),
    suClsSaleMtAvrg: randInt(s, 6, 24, 63),
  };
}

// --- info/flpop ---

export function generateFlpop(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const tot = randInt(s, 5000, 500000, 30);
  const ml = Math.round(tot * (0.45 + (hash(s, 31) % 10) / 100));
  const fml = tot - ml;

  return {
    stdrYyquCd: Number(QUARTER),
    trdarSeCd: row?.trdar_se_cd ?? "A",
    trdarSeCdNm: row?.trdar_se_cd_nm ?? "골목상권",
    trdarCd,
    trdarCdNm: row?.trdar_cd_nm ?? `상권${trdarCd}`,
    totFlpopCo: tot,
    mlFlpopCo: ml,
    fmlFlpopCo: fml,
    agrde10FlpopCo: randInt(s, tot * 0.05, tot * 0.1, 300),
    agrde20FlpopCo: randInt(s, tot * 0.15, tot * 0.25, 301),
    agrde30FlpopCo: randInt(s, tot * 0.2, tot * 0.3, 302),
    agrde40FlpopCo: randInt(s, tot * 0.15, tot * 0.25, 303),
    agrde50FlpopCo: randInt(s, tot * 0.1, tot * 0.2, 304),
    agrde60AboveFlpopCo: randInt(s, tot * 0.05, tot * 0.1, 305),
    tmzon0006FlpopCo: randInt(s, tot * 0.02, tot * 0.05, 310),
    tmzon0611FlpopCo: randInt(s, tot * 0.1, tot * 0.18, 311),
    tmzon1114FlpopCo: randInt(s, tot * 0.18, tot * 0.28, 312),
    tmzon1417FlpopCo: randInt(s, tot * 0.15, tot * 0.25, 313),
    tmzon1721FlpopCo: randInt(s, tot * 0.18, tot * 0.28, 314),
    tmzon2124FlpopCo: randInt(s, tot * 0.05, tot * 0.12, 315),
    monFlpopCo: randInt(s, tot * 0.12, tot * 0.17, 320),
    tuesFlpopCo: randInt(s, tot * 0.12, tot * 0.17, 321),
    wedFlpopCo: randInt(s, tot * 0.12, tot * 0.17, 322),
    thurFlpopCo: randInt(s, tot * 0.12, tot * 0.17, 323),
    friFlpopCo: randInt(s, tot * 0.13, tot * 0.18, 324),
    satFlpopCo: randInt(s, tot * 0.1, tot * 0.16, 325),
    sunFlpopCo: randInt(s, tot * 0.08, tot * 0.14, 326),
  };
}

// --- info/repop ---

export function generateRepop(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const tot = randInt(s, 1000, 100000, 40);
  const ml = Math.round(tot * (0.47 + (hash(s, 41) % 6) / 100));
  const fml = tot - ml;
  const totHshld = randInt(s, Math.round(tot * 0.3), Math.round(tot * 0.5), 45);
  const aptHshld = Math.round(totHshld * (0.4 + (hash(s, 46) % 20) / 100));

  const ageRatios = [0.06, 0.14, 0.18, 0.2, 0.22, 0.2];

  return {
    stdrYyquCd: QUARTER,
    trdarSeCd: row?.trdar_se_cd ?? "A",
    trdarSeCdNm: row?.trdar_se_cd_nm ?? "골목상권",
    trdarCd,
    trdarCdNm: row?.trdar_cd_nm ?? `상권${trdarCd}`,
    totRepopCo: tot,
    mlRepopCo: ml,
    fmlRepopCo: fml,
    agrde10RepopCo: Math.round(tot * ageRatios[0]),
    agrde20RepopCo: Math.round(tot * ageRatios[1]),
    agrde30RepopCo: Math.round(tot * ageRatios[2]),
    agrde40RepopCo: Math.round(tot * ageRatios[3]),
    agrde50RepopCo: Math.round(tot * ageRatios[4]),
    agrde60AboveRepopCo: Math.round(tot * ageRatios[5]),
    mag10RepopCo: Math.round(ml * ageRatios[0]),
    mag20RepopCo: Math.round(ml * ageRatios[1]),
    mag30RepopCo: Math.round(ml * ageRatios[2]),
    mag40RepopCo: Math.round(ml * ageRatios[3]),
    mag50RepopCo: Math.round(ml * ageRatios[4]),
    mag60AboveRepopCo: Math.round(ml * ageRatios[5]),
    fag10RepopCo: Math.round(fml * ageRatios[0]),
    fag20RepopCo: Math.round(fml * ageRatios[1]),
    fag30RepopCo: Math.round(fml * ageRatios[2]),
    fag40RepopCo: Math.round(fml * ageRatios[3]),
    fag50RepopCo: Math.round(fml * ageRatios[4]),
    fag60AboveRepopCo: Math.round(fml * ageRatios[5]),
    totHshldCo: totHshld,
    aptHshldCo: aptHshld,
    nonAptHshldCo: totHshld - aptHshld,
  };
}

// --- info/wrc-popltn ---

export function generateWrcPopltn(trdarCd: number) {
  const s = trdarCd;
  const row = findTradeArea(trdarCd);
  const tot = randInt(s, 500, 80000, 50);
  const ml = Math.round(tot * (0.5 + (hash(s, 51) % 10) / 100));
  const fml = tot - ml;

  const ageRatios = [0.03, 0.12, 0.24, 0.28, 0.22, 0.11];

  return {
    stdrYyquCd: QUARTER,
    trdarSeCd: row?.trdar_se_cd ?? "A",
    trdarSeCdNm: row?.trdar_se_cd_nm ?? "골목상권",
    trdarCd,
    trdarCdNm: row?.trdar_cd_nm ?? `상권${trdarCd}`,
    totWrcPopltnCo: tot,
    mlWrcPopltnCo: ml,
    fmlWrcPopltnCo: fml,
    agrde10WrcPopltnCo: Math.round(tot * ageRatios[0]),
    agrde20WrcPopltnCo: Math.round(tot * ageRatios[1]),
    agrde30WrcPopltnCo: Math.round(tot * ageRatios[2]),
    agrde40WrcPopltnCo: Math.round(tot * ageRatios[3]),
    agrde50WrcPopltnCo: Math.round(tot * ageRatios[4]),
    agrde60AboveWrcPopltnCo: Math.round(tot * ageRatios[5]),
    mag10WrcPopltnCo: Math.round(ml * ageRatios[0]),
    mag20WrcPopltnCo: Math.round(ml * ageRatios[1]),
    mag30WrcPopltnCo: Math.round(ml * ageRatios[2]),
    mag40WrcPopltnCo: Math.round(ml * ageRatios[3]),
    mag50WrcPopltnCo: Math.round(ml * ageRatios[4]),
    mag60AboveWrcPopltnCo: Math.round(ml * ageRatios[5]),
    fag10WrcPopltnCo: Math.round(fml * ageRatios[0]),
    fag20WrcPopltnCo: Math.round(fml * ageRatios[1]),
    fag30WrcPopltnCo: Math.round(fml * ageRatios[2]),
    fag40WrcPopltnCo: Math.round(fml * ageRatios[3]),
    fag50WrcPopltnCo: Math.round(fml * ageRatios[4]),
    fag60AboveWrcPopltnCo: Math.round(fml * ageRatios[5]),
  };
}
