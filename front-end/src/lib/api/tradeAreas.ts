import { API_BASE_URL } from '@/config/api';

const BASE_URL = API_BASE_URL;

// 동 이름 정규화: 서버 DB 키와 일치하도록 변환
function normalizeDongName(dongName: string): string {
  const trimmed = (dongName || '').trim();
  // 종로1.2.3.4가동/종로1·2·3·4가동 등 구분점들을 '?'로 치환
  let normalized = trimmed.replace(/[\.|·|ㆍ]/g, '?');
  // 특수 케이스: 역삼동 → 역삼1동
  if (normalized === '역삼동') {
    return '역삼1동';
  }
  // 면목 3·8동 표기 통일 (제, 점/가운뎃점/물음표 등)
  const noSpace = normalized.replace(/\s+/g, '');
  if (/^면목(제)?3[\.·ㆍ\?]8동$/.test(noSpace)) {
    normalized = '면목3?8동';
  }
  return normalized;
}

export async function fetchGuList(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/api/v1/data/list-gu`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch district list: ${response.status}`);
  }

  const data: {
    httpStatus: string;
    isSuccess: boolean;
    message: string;
    code: number;
    result: string[];
  } = await response.json();

  if (!data.isSuccess || !Array.isArray(data.result)) {
    throw new Error("District API returned an unexpected shape");
  }

  return data.result;
}

export async function fetchDongList(guName: string): Promise<string[]> {
  const url = new URL(`${BASE_URL}/api/v1/data/list-dong`);
  url.searchParams.set("district", guName);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dong list: ${response.status}`);
  }

  const data: {
    httpStatus: string;
    isSuccess: boolean;
    message: string;
    code: number;
    result: string[];
  } = await response.json();

  if (!data.isSuccess || !Array.isArray(data.result)) {
    throw new Error("Dong API returned an unexpected shape");
  }

  return data.result;
}

export async function fetchTradeAreas(guName: string, dongName: string): Promise<string[]> {
  const url = new URL(`${BASE_URL}/api/v1/data/trade-areas`);
  url.searchParams.set("district", guName);
  url.searchParams.set("dong", normalizeDongName(dongName));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trade areas: ${response.status}`);
  }

  const data: {
    httpStatus: string;
    isSuccess: boolean;
    message: string;
    code: number;
    result: {
      districtNameKor: string;
      dongNameKor: string;
      areas: Array<{
        trdarSeCd: string;
        trdarSeCdNm: string;
        trdarCd: number;
        trdarCdNm: string;
      }>;
    } | null;
  } = await response.json();

  if (!data.isSuccess) {
    throw new Error("Trade area API returned unsuccessful status");
  }

  const names = data.result?.areas?.map((area) => area.trdarCdNm).filter(Boolean) ?? [];
  if (!names.length) {
    throw new Error("Trade area API returned empty list");
  }

  return names;
}

// 상권 상세 데이터를 포함한 전체 목록 조회
export async function fetchTradeAreasDetail(guName: string, dongName: string) {
  const url = new URL(`${BASE_URL}/api/v1/data/trade-areas`);
  url.searchParams.set("district", guName);
  url.searchParams.set("dong", normalizeDongName(dongName));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trade areas: ${response.status}`);
  }

  const data: {
    httpStatus: string;
    isSuccess: boolean;
    message: string;
    code: number;
    result: {
      districtNameKor: string;
      dongNameKor: string;
      areas: Array<{
        trdarSeCd: string;
        trdarSeCdNm: string;
        trdarCd: number;
        trdarCdNm: string;
        xcntsValue: number;
        ydntsValue: number;
        relmAr: number;
        storCo: number;
        similrIndutyStorCo: number;
      }>;
    };
  } = await response.json();

  if (!data.isSuccess || !data.result) {
    throw new Error("Trade area API returned unsuccessful status");
  }

  return data.result;
}

// 실제 API 응답 구조에 맞는 인터페이스
export interface TradeAreaDetail {
  trdarCd: number;
  trdarCdNm: string;
  chnge?: {
    stdrYyquCd: string;
    trdrChngeIx: string;
  };
  sales?: {
    stdrYyquCd: string;
    thsmonSelngAmt: number;
    thsmonSelngCo: number;
    mdwkSelngAmt: number;
    wkendSelngAmt: number;
    mdwkSelngCo: number;
    wkendSelngCo: number;
  };
  stor?: {
    stdrYyquCd: string;
    storCo: number;
    frcStorCo: number;
    opbizRt: number;
    opbizStorCo: number;
    clsbizRt: number;
    clsbizStorCo: number;
  };
  flpop?: {
    stdrYyquCd: number;
    totFlpopCo: number;
  };
  repop?: {
    stdrYyquCd: string;
    totRepopCo: number;
  };
  wrc?: {
    stdrYyquCd: string;
    totWrcPopltnCo: number;
  };
}

export async function fetchTradeAreaDetail(tradeAreaCode: number | string): Promise<TradeAreaDetail> {
  const url = new URL(`${BASE_URL}/api/v1/data/trade-area-detail`);
  url.searchParams.set("trdarCd", String(tradeAreaCode));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trade area detail: ${response.status}`);
  }

  const data: {
    httpStatus: string;
    isSuccess: boolean;
    message: string;
    code: number;
    result: TradeAreaDetail | null;
  } = await response.json();

  if (!data.isSuccess || !data.result) {
    throw new Error("Trade area detail API returned an unexpected shape");
  }

  return data.result;
}

// 데이터 매핑 함수 - 매출, 점포, 인구, 상권 변화 지표 순으로 정렬
export function mapTradeAreaDetailToMetrics(detail: TradeAreaDetail | null) {
  if (!detail) {
    return {
      sales: { key: "매출", value: "-", numValue: 0 },
      stores: { key: "점포", value: "-", numValue: 0 },
      floating: { key: "유동인구", value: "-", numValue: 0 },
      residents: { key: "상주인구", value: "-", numValue: 0 },
      workers: { key: "직장인구", value: "-", numValue: 0 },
      changeIndex: { key: "상권변화지표", value: "-", numValue: 0 }
    };
  }

  // 매출 (천만원 단위로 변환)
  const salesAmount = detail.sales?.thsmonSelngAmt || 0;
  const salesValue = salesAmount >= 100000000 
    ? `${(salesAmount / 100000000).toFixed(1)}억 원` 
    : `${Math.round(salesAmount / 10000).toLocaleString()}만 원`;

  // 점포 수
  const storeCount = detail.stor?.storCo || 0;
  const storeValue = `${storeCount.toLocaleString()} 개`;

  // 유동인구 (만 단위로 변환)
  const floatingCount = detail.flpop?.totFlpopCo || 0;
  const floatingValue = floatingCount >= 10000 
    ? `${Math.round(floatingCount / 10000).toLocaleString()}만 명` 
    : `${floatingCount.toLocaleString()} 명`;

  // 상주인구 (만 단위로 변환)
  const residentCount = detail.repop?.totRepopCo || 0;
  const residentValue = residentCount >= 10000 
    ? `${Math.round(residentCount / 10000).toLocaleString()}만 명` 
    : `${residentCount.toLocaleString()} 명`;

  // 직장인구 (만 단위로 변환)
  const workerCount = detail.wrc?.totWrcPopltnCo || 0;
  const workerValue = workerCount >= 10000 
    ? `${Math.round(workerCount / 10000).toLocaleString()}만 명` 
    : `${workerCount.toLocaleString()} 명`;

  // 상권변화지표 (코드를 한국어로 변환)
  const getIndicatorName = (indicator: string) => {
    switch (indicator) {
      case "LL": return "다이나믹";
      case "LH": return "상권 확장";
      case "HL": return "상권 축소";
      case "HH": return "정체";
      default: return indicator;
    }
  };
  const changeIndex = detail.chnge?.trdrChngeIx ? getIndicatorName(detail.chnge.trdrChngeIx) : "-";

  return {
    sales: { key: "매출", value: salesValue, numValue: salesAmount },
    stores: { key: "점포", value: storeValue, numValue: storeCount },
    floating: { key: "유동인구", value: floatingValue, numValue: floatingCount },
    residents: { key: "상주인구", value: residentValue, numValue: residentCount },
    workers: { key: "직장인구", value: workerValue, numValue: workerCount },
    changeIndex: { key: "상권변화지표", value: changeIndex, numValue: 0 }
  };
}

// 종합 분석 점수 타입 정의
export interface TradeAreaScore {
  district: string;
  dong: string;
  areaName: string;
  areaType: string;
  totalScore: number;
  sustainabilityScore: number;
  profitabilityScore: number;
  accessibilityScore: number;
  riskScore: number;
  competitionScore: number;
}

// 종합 분석 점수 API 응답 타입
interface TradeAreaScoreResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: TradeAreaScore;
}

// 상권 코드로 상권명을 찾는 유틸 함수
export function getTradeAreaNameByCode(tradeAreaCode: string): string {
  // TradeAreaPicker에서 사용하는 데이터와 동일한 방식으로 불러오기
  try {
    const TradeAreaRawData = require("@/data/TradeAreaValue.json");
    const tradeArea = TradeAreaRawData.DATA.find((item: any) => item.trdar_cd === tradeAreaCode);
    return tradeArea?.trdar_cd_nm || "상권명 없음";
  } catch (error) {
    console.warn('Trade area data not found:', error);
    return "상권명 없음";
  }
}

// 종합 분석 점수 조회 API
export async function fetchTradeAreaScore(tradeAreaName: string): Promise<TradeAreaScore> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/data/score?trdarCdNm=${encodeURIComponent(tradeAreaName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TradeAreaScoreResponse = await response.json();
    
    if (!data.isSuccess) {
      throw new Error(data.message || '점수 조회에 실패했습니다.');
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching trade area score:', error);
    throw error;
  }
}