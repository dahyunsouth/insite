"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import SalesTimeChart from "@/components/molecules/Detail/SalesCard/SalesCharts/SalesTimeChart";
import SalesWeekChart from "@/components/molecules/Detail/SalesCard/SalesCharts/SalesWeekChart";
import SalesInfoModal from "@/components/molecules/Detail/SalesCard/SalesInfoModal";

type Props = { trdarCode: string | null };

type SalesApiResponse = {
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
  result: {
    stdrYyquCd: string;
    trdarSeCd: string;
    trdarSeCdNm: string;
    trdarCd: number;
    trdarCdNm: string;
    svcIndutyCd: string;
    svcIndutyCdNm: string;
    thsmonSelngAmt: number;
    mdwkSelngAmt: number;
    wkendSelngAmt: number;
    monSelngAmt: number;
    tuesSelngAmt: number;
    wedSelngAmt: number;
    thurSelngAmt: number;
    friSelngAmt: number;
    satSelngAmt: number;
    sunSelngAmt: number;
    tmzon0006SelngAmt: number;
    tmzon0611SelngAmt: number;
    tmzon1114SelngAmt: number;
    tmzon1417SelngAmt: number;
    tmzon1721SelngAmt: number;
    tmzon2124SelngAmt: number;
    mlSelngAmt: number;
    fmlSelngAmt: number;
    agrde10SelngAmt: number;
    agrde20SelngAmt: number;
    agrde30SelngAmt: number;
    agrde40SelngAmt: number;
    agrde50SelngAmt: number;
    agrde60AboveSelngAmt: number;
    thsmonSelngCo: number;
    mdwkSelngCo: number;
    wkendSelngCo: number;
    monSelngCo: number;
    tuesSelngCo: number;
    wedSelngCo: number;
    thurSelngCo: number;
    friSelngCo: number;
    satSelngCo: number;
    sunSelngCo: number;
    tmzon0006SelngCo: number;
    tmzon0611SelngCo: number;
    tmzon1114SelngCo: number;
    tmzon1417SelngCo: number;
    tmzon1721SelngCo: number;
    tmzon2124SelngCo: number;
    mlSelngCo: number;
    fmlSelngCo: number;
    agrde10SelngCo: number;
    agrde20SelngCo: number;
    agrde30SelngCo: number;
    agrde40SelngCo: number;
    agrde50SelngCo: number;
    agrde60AboveSelngCo: number;
  };
};

export default function SalesCard({ trdarCode }: Props) {
  const [data, setData] = useState<SalesApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"time" | "day">("time");
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
        const url = `/api/v1/data/info/sales?trdarCd=${trdarCode}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("sales data failed");
        const payload = (await res.json()) as SalesApiResponse;
        if (aborted) return;
        setData(payload);
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


  // 시간대별 데이터 변환
  const timeLabels = useMemo(() => {
    if (!data?.result) return [];
    return ["00-06시", "06-11시", "11-14시", "14-17시", "17-21시", "21-24시"];
  }, [data]);

  const timeValues = useMemo(() => {
    if (!data?.result) return [];
    const result = data.result;
    return [
      result.tmzon0006SelngAmt,
      result.tmzon0611SelngAmt,
      result.tmzon1114SelngAmt,
      result.tmzon1417SelngAmt,
      result.tmzon1721SelngAmt,
      result.tmzon2124SelngAmt,
    ];
  }, [data]);

  const timeCounts = useMemo(() => {
    if (!data?.result) return [];
    const result = data.result;
    return [
      result.tmzon0006SelngCo,
      result.tmzon0611SelngCo,
      result.tmzon1114SelngCo,
      result.tmzon1417SelngCo,
      result.tmzon1721SelngCo,
      result.tmzon2124SelngCo,
    ];
  }, [data]);

  const timeMaxIndex = useMemo(() => {
    if (!data?.result) return null;
    const values = timeValues;
    const maxValue = Math.max(...values);
    return values.findIndex(v => v === maxValue);
  }, [data, timeValues]);

  // 요일별 데이터 변환
  const dayLabels = useMemo(() => {
    if (!data?.result) return [];
    return ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  }, [data]);

  const dayValues = useMemo(() => {
    if (!data?.result) return [];
    const result = data.result;
    return [
      result.monSelngAmt,
      result.tuesSelngAmt,
      result.wedSelngAmt,
      result.thurSelngAmt,
      result.friSelngAmt,
      result.satSelngAmt,
      result.sunSelngAmt,
    ];
  }, [data]);

  const dayCounts = useMemo(() => {
    if (!data?.result) return [];
    const result = data.result;
    return [
      result.monSelngCo,
      result.tuesSelngCo,
      result.wedSelngCo,
      result.thurSelngCo,
      result.friSelngCo,
      result.satSelngCo,
      result.sunSelngCo,
    ];
  }, [data]);

  const dayMaxIndex = useMemo(() => {
    if (!data?.result) return null;
    const values = dayValues;
    const maxValue = Math.max(...values);
    return values.findIndex(v => v === maxValue);
  }, [data, dayValues]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-[18px] font-semibold text-gray-900">매출</h3>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect();
              setModalPosition({
                top: rect.top,
                left: rect.right
              });
            }
            setIsInfoModalOpen(!isInfoModalOpen);
          }}
          className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-white transition-colors hover:bg-gray-400 active:bg-gray-600"
          aria-label="매출 정보"
        >
          <span className="text-xs font-bold">i</span>
        </button>
        {data?.result?.stdrYyquCd && (
          <span className="text-xs text-gray-400">
            {data.result.stdrYyquCd.slice(0, 4)}년도 {data.result.stdrYyquCd.slice(4)}분기 기준
          </span>
        )}
      </div>

      {/* Segmented control: 시간대별 / 요일별 */}
      <div className="mt-4 w-full rounded-xl bg-gray-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode("time")}
            aria-pressed={mode === "time"}
            className={
              `cursor-pointer w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "time" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            시간대별 추이
          </button>
          <button
            type="button"
            onClick={() => setMode("day")}
            aria-pressed={mode === "day"}
            className={
              `cursor-pointer w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "day" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            요일별 추이
          </button>
        </div>
      </div>

      {/* Highlight */}
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-center text-gray-900">
        {trdarCode == null ? (
          <span className="text-gray-500">상권을 선택하면 매출 정보를 보여드려요.</span>
        ) : loading ? (
          <span className="text-gray-500">불러오는 중…</span>
        ) : error ? (
          <span className="text-rose-600">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</span>
        ) : data ? (
          <>
            {mode === "time" ? (
              <>
                <span className="font-medium">매출이 가장 많은 시간대는</span>
                <span className="ml-1 font-bold text-[#3288FF]">{timeLabels[timeMaxIndex ?? 0]}</span>
                <span className="ml-1 font-medium">입니다.</span>
              </>
            ) : (
              <>
                <span className="font-medium">매출이 가장 많은 요일은</span>
                <span className="ml-1 font-bold text-[#3288FF]">{dayLabels[dayMaxIndex ?? 0]}</span>
                <span className="ml-1 font-medium">입니다.</span>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-500">데이터가 없습니다.</span>
        )}
      </div>

      {/* 선택 모드별 최다/최소 표 */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
        <div className="grid grid-cols-2">
          <div className="bg-[#3288FF1A] px-4 py-3 text-center text-sm font-semibold text-black">
            {mode === "time" ? "매출이 가장 많은 시간대" : "주중매출금액(건수)"}
          </div>
          <div className={`border-l border-gray-200 px-4 py-3 text-center text-sm font-semibold text-black ${mode === "time" ? "bg-red-50" : "bg-[#3288FF1A]"}`}>
            {mode === "time" ? "매출이 가장 적은 시간대" : "주말매출금액(건수)"}
          </div>
          <div className="px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMaxIndex !== null ? (
                <>
                  <span className="font-semibold">{timeLabels[timeMaxIndex]}</span>
                  <span className="ml-2 text-gray-500">{formatCurrency(timeValues[timeMaxIndex])} ({timeCounts[timeMaxIndex].toLocaleString()}건)</span>
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data ? (
              <>
                <span className="font-semibold">{formatCurrency(data.result.mdwkSelngAmt)}</span>
                <span className="ml-2 text-gray-500">({data.result.mdwkSelngCo.toLocaleString()}건)</span>
              </>
            ) : (
              <span className="text-gray-500">데이터 없음</span>
            )}
          </div>
          <div className="border-l border-gray-200 px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMaxIndex !== null ? (
                <>
                  <span className="font-semibold">{timeLabels[timeValues.indexOf(Math.min(...timeValues))]}</span>
                  <span className="ml-2 text-gray-500">{formatCurrency(Math.min(...timeValues))} ({timeCounts[timeValues.indexOf(Math.min(...timeValues))].toLocaleString()}건)</span>
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data ? (
              <>
                <span className="font-semibold">{formatCurrency(data.result.wkendSelngAmt)}</span>
                <span className="ml-2 text-gray-500">({data.result.wkendSelngCo.toLocaleString()}건)</span>
              </>
            ) : (
              <span className="text-gray-500">데이터 없음</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {mode === "time" ? (
        <div className="mt-4 rounded-2xl border border-gray-200 p-3 overflow-x-auto">
          {data && timeLabels.length > 0 ? (
            <SalesTimeChart labels={timeLabels} values={timeValues} counts={timeCounts} maxIndex={timeMaxIndex} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">차트를 표시할 데이터가 없습니다.</div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-gray-200 p-3 overflow-x-auto">
          {data && dayLabels.length === 7 && dayValues.some((v) => Number.isFinite(v) && v > 0) ? (
            <SalesWeekChart labels={dayLabels} values={dayValues} counts={dayCounts} maxIndex={dayMaxIndex} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">차트를 표시할 데이터가 없습니다.</div>
          )}
        </div>
      )}




      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 매출 정보를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
      ) : null}

      {/* Info Modal */}
      <SalesInfoModal 
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
      <div className={`mt-2 text-[22px] font-bold text-gray-900 ${primaryClass}`}>{primary}</div>
      <div className="mt-1 text-xs text-gray-500">{secondary}</div>
    </div>
  );
}


function Placeholder() {
  return <div className="h-3 w-full rounded-full bg-gray-100" />;
}

function formatCurrency(v: number) {
  if (v >= 100000000) {
    return `${Math.round(v / 100000000)}억원`;
  } else if (v >= 10000000) {
    return `${(v / 10000000).toFixed(1)}천만원`;
  } else if (v >= 10000) {
    return `${Math.round(v / 10000)}만원`;
  }
  return `${v.toLocaleString()}원`;
}


function formatPercent(v: number) {
  const digits = Math.abs(v) < 10 ? 1 : 0;
  return `${v.toFixed(digits)}%`;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}