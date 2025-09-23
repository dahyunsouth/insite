"use client";

import React, { useEffect, useState, useRef } from "react";
import MarketChangeIndicatorInfoModal from "./MarketChangeIndicatorInfoModal";

type Props = { trdarCode: string | null };

type MarketChangeResponse = {
  stdrYyquCd: string;
  trdarSeCd: string;
  trdarSeCdNm: string;
  trdarCd: number;
  trdarCdNm: string;
  trdarChngeIx: string;
  trdarChngeIxNm: string;
  oprSaleMtAvrg: number;
  clsSaleMtAvrg: number;
  suOprSaleMtAvrg: number;
  suClsSaleMtAvrg: number;
};

type ApiResponse = {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: MarketChangeResponse;
};

import { API_BASE_URL } from '@/config/api';

const MARKET_CHANGE_ENDPOINT = `${API_BASE_URL}/api/v1/data/info/chnge-ix`;

export default function MarketChangeIndicatorCard({ trdarCode }: Props) {
  const [data, setData] = useState<MarketChangeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!trdarCode) {
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `${MARKET_CHANGE_ENDPOINT}?trdarCd=${trdarCode}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("market change info failed");
        const json = (await res.json()) as ApiResponse;
        if (!json?.isSuccess || !json?.result) {
          throw new Error("market change info payload invalid");
        }
        if (aborted) return;
        setData(json.result);
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? "load failed");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [trdarCode]);

  // 상권 변화 지표에 따른 색상 결정
  const getIndicatorColor = (indicator: string) => {
    switch (indicator) {
      case "LL": return "text-red-600"; // 다이나믹 - 빨강
      case "LH": return "text-green-600"; // 상권 확장 - 초록
      case "HL": return "text-blue-600"; // 상권 축소 - 파랑
      case "HH": return "text-orange-600"; // 정체 - 주황
      default: return "text-gray-600";
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-semibold text-gray-900">상권 변화 지표</h3>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => {
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setModalPosition({
                  top: rect.bottom - 350,
                  left: rect.right
                });
              }
              setIsInfoModalOpen(!isInfoModalOpen);
            }}
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-white transition-colors hover:bg-gray-400 active:bg-gray-600"
            aria-label="상권 변화 지표 정보"
          >
            <span className="text-xs font-bold">i</span>
          </button>
          {data?.stdrYyquCd && (
            <span className="text-xs text-gray-400">
              {data.stdrYyquCd.slice(0, 4)}년도 {data.stdrYyquCd.slice(4)}분기 기준
            </span>
          )}
        </div>
        {/* 상권 변화 지표명 표시 */}
        {data?.trdarChngeIxNm && (
          <span className={`text-lg font-bold ${getIndicatorColor(data.trdarChngeIx)}`}>
            {data.trdarChngeIxNm}
          </span>
        )}
      </div>

      {/* Grid KPIs */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 상권 기준 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1 rounded-lg inline-block">{data?.trdarCdNm || "상권"} 기준</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-blue-600 mb-1">운영 개월</div>
              <div className="text-lg font-bold text-gray-900">
                {data ? `${formatNumber(data.oprSaleMtAvrg)}개월` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-red-600 mb-1">폐업 개월</div>
              <div className="text-lg font-bold text-gray-900">
                {data ? `${formatNumber(data.clsSaleMtAvrg)}개월` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* 서울시 기준 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-1 rounded-lg inline-block">서울시 기준</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-blue-600 mb-1">운영 개월</div>
              <div className="text-lg font-bold text-gray-900">
                {data ? `${formatNumber(data.suOprSaleMtAvrg)}개월` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-red-600 mb-1">폐업 개월</div>
              <div className="text-lg font-bold text-gray-900">
                {data ? `${formatNumber(data.suClsSaleMtAvrg)}개월` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 상권 변화 지표를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
      ) : null}

      {/* Info Modal */}
      <MarketChangeIndicatorInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)}
        position={modalPosition}
      />
    </div>
  );
}

function KpiTile({ title, primary, secondary }: { title: string; primary: string; secondary: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div className="mt-2 text-[22px] font-bold text-gray-900">{primary}</div>
      <div className="mt-1 text-xs text-gray-500">{secondary}</div>
    </div>
  );
}

function formatNumber(v: number) {
  return v.toLocaleString();
}
