"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import StoreInfoModal from "./StoreInfoModal";

type Props = { trdarCode: string | null };

type StoreResponse = {
  stdrYyquCd: string;
  trdarSeCd: string;
  trdarSeCdNm: string;
  trdarCd: number;
  trdarCdNm: string;
  storCo: number;
  similrIndutyStorCo: number;
  opbizRt: number;
  opbizStorCo: number;
  clsbizRt: number;
  clsbizStorCo: number;
  frcStorCo: number;
  netIncrease: number;
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
  result: StoreResponse;
};

import { API_BASE_URL } from '@/config/api';

const STORE_INFO_ENDPOINT = `${API_BASE_URL}/api/v1/data/info/stor`;

export default function StoreCard({ trdarCode }: Props) {
  const [data, setData] = useState<StoreResponse | null>(null);
  const [quarter, setQuarter] = useState<string | null>(null);
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
        const url = `${STORE_INFO_ENDPOINT}?trdarCd=${trdarCode}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("store info failed");
        const json = (await res.json()) as ApiResponse;
        if (!json?.isSuccess || !json?.result) {
          throw new Error("store info payload invalid");
        }
        if (aborted) return;
        setData(json.result);
        setQuarter(json.result.stdrYyquCd);
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


  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <h3 className="text-[18px] font-semibold text-gray-900">점포</h3>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect();
              setModalPosition({
                top: rect.bottom - 350, // 모달을 조금 더 위로 올림
                left: rect.right
              });
            }
            setIsInfoModalOpen(!isInfoModalOpen);
          }}
          className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-white transition-colors hover:bg-gray-400 active:bg-gray-600"
          aria-label="점포 정보"
        >
          <span className="text-xs font-bold">i</span>
        </button>
        {data?.stdrYyquCd && (
          <span className="text-xs text-gray-400">
            {data.stdrYyquCd.slice(0, 4)}년도 {data.stdrYyquCd.slice(4)}분기 기준
          </span>
        )}
      </div>


      {/* Grid KPIs */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stores */}
        <KpiTile
          title="점포"
          primary={data ? `${formatNumber(data.storCo)}개` : "—"}
          secondary={data ? `유사 업종 ${formatNumber(data.similrIndutyStorCo)}개, 프랜차이즈 ${formatNumber(data.frcStorCo)}개` : "—"}
        />
        {/* Open */}
        <KpiTile
          title="개업"
          primaryClass="text-[#3288FF]"
          primary={data ? `${formatPercent(data.opbizRt)}` : "—"}
          secondary={data ? `${formatNumber(data.opbizStorCo)}개` : "—"}
        />
        {/* Close */}
        <KpiTile
          title="폐업"
          primaryClass="text-rose-600"
          primary={data ? `${formatPercent(data.clsbizRt)}` : "—"}
          secondary={data ? `${formatNumber(data.clsbizStorCo)}개` : "—"}
        />
      </div>

      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 점포 지표를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
      ) : null}

      {/* Info Modal */}
      <StoreInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)}
        position={modalPosition}
      />
    </div>
  );
}

function KpiTile({ title, primary, secondary, primaryClass = "" }: { title: string; primary: string; secondary: string; primaryClass?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div className={`mt-2 text-[22px] font-bold ${primaryClass || 'text-gray-900'}`}>{primary}</div>
      <div className="mt-1 text-xs text-gray-500">{secondary}</div>
    </div>
  );
}

function formatNumber(v: number) {
  return v.toLocaleString();
}

function formatPercent(v: number) {
  // keep one decimal place when < 10%, otherwise 0 decimal
  const digits = Math.abs(v) < 10 ? 1 : 0;
  return `${v.toFixed(digits)}%`;
}
