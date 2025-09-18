const BASE_URL = "http://43.203.196.29:8080";

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
  url.searchParams.set("dong", dongName);

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
  url.searchParams.set("dong", dongName);

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
  TRDAR_CD: string;
  TRDAR_CD_NM: string;
  trade_area_trdar_chnge_ix?: {
    STDR_YYQU_CD: string;
    TRDR_CHNGE_IX: string;
  };
  trade_area_sales_cd?: {
    STDR_YYQU_CD: string;
    THSMON_SELNG_AMT: number;
    THSMON_SELNG_CO: number;
    MDWK_SELNG_AMT: number;
    WKEND_SELNG_AMT: number;
    MDWK_SELNG_CO: number;
    WKEND_SELNG_CO: number;
  };
  trade_area_stor_cd?: {
    STDR_YYQU_CD: string;
    STOR_CO: number;
    FRC_STOR_CO: number;
    OPBIZ_RT: number;
    OPBIZ_STOR_CO: number;
    CLSBIZ_RT: number;
    CLSBIZ_STOR_CO: number;
  };
  trade_area_flpop_cd?: {
    STDR_YYQU_CD: string;
    TOT_FLPOP_CO: number;
  };
  trade_area_repop_cd?: {
    STDR_YYQU_CD: string;
    TOT_REPOP_CO: number;
  };
  trade_area_wrc_popltn_cd?: {
    STDR_YYQU_CD: string;
    TOT_WRC_POPLTN_CO: number;
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
      sales: { key: "매출", value: "0", numValue: 0 },
      stores: { key: "점포", value: "0", numValue: 0 },
      residents: { key: "상주인구", value: "0", numValue: 0 },
      workers: { key: "직장인구", value: "0", numValue: 0 },
      changeIndex: { key: "상권변화지표", value: "-", numValue: 0 }
    };
  }

  // 매출 (천만원 단위로 변환)
  const salesAmount = detail.trade_area_sales_cd?.THSMON_SELNG_AMT || 0;
  const salesValue = salesAmount >= 100000000 
    ? `${Math.round(salesAmount / 100000000)}억` 
    : `${Math.round(salesAmount / 10000)}만`;

  // 점포 수
  const storeCount = detail.trade_area_stor_cd?.STOR_CO || 0;
  const storeValue = storeCount.toString();

  // 상주인구 (천 단위로 변환)
  const residentCount = detail.trade_area_repop_cd?.TOT_REPOP_CO || 0;
  const residentValue = residentCount >= 1000 
    ? `${Math.round(residentCount / 1000)}K` 
    : residentCount.toString();

  // 직장인구 (천 단위로 변환)
  const workerCount = detail.trade_area_wrc_popltn_cd?.TOT_WRC_POPLTN_CO || 0;
  const workerValue = workerCount >= 1000 
    ? `${Math.round(workerCount / 1000)}K` 
    : workerCount.toString();

  // 상권변화지표
  const changeIndex = detail.trade_area_trdar_chnge_ix?.TRDR_CHNGE_IX || "-";

  return {
    sales: { key: "매출", value: salesValue, numValue: salesAmount },
    stores: { key: "점포", value: storeValue, numValue: storeCount },
    residents: { key: "상주인구", value: residentValue, numValue: residentCount },
    workers: { key: "직장인구", value: workerValue, numValue: workerCount },
    changeIndex: { key: "상권변화지표", value: changeIndex, numValue: 0 }
  };
}
