"use client";

import React, { useEffect, useMemo, useState } from "react";
import TimeSlotBarChart from "@/components/molecules/Detail/PopulationCard/Charts/FloatingPopulationTimeChart";

type Props = { trdarCode: string | null };

type SalesResponse = {
  trdarCd: string;
  trdarNm: string;
  totalSales: number;
  avgSalesPerStore: number;
  salesGrowthRate: number;
  peakHour: string;
  peakDaySales: number;
  weekdaySales: number;
  weekendSales: number;
  // 시간대별 매출 데이터
  timeSlots: { key: string; label: string; value: number }[];
  timeMax: { index: number; label: string; value: number };
  timeMin: { index: number; label: string; value: number };
  // 요일별 매출 데이터
  daySlots: { key: string; label: string; value: number }[];
  dayMax: { index: number; label: string; value: number };
  dayMin: { index: number; label: string; value: number };
  monthlySales: {
    [key: string]: number;
  };
};

export default function SalesCard({ trdarCode }: Props) {
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"time" | "day">("time");

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
        // TODO: 실제 API 엔드포인트로 변경 필요
        // 현재는 더미 데이터 사용
        const dummyData: SalesResponse = {
          trdarCd: trdarCode,
          trdarNm: "상권명",
          totalSales: 2450000000,
          avgSalesPerStore: 45600000,
          salesGrowthRate: 12.5,
          peakHour: "19:00-20:00",
          peakDaySales: 350000000,
          weekdaySales: 1680000000,
          weekendSales: 770000000,
          timeSlots: [
            { key: "06-08", label: "06-08시", value: 120000000 },
            { key: "08-10", label: "08-10시", value: 180000000 },
            { key: "10-12", label: "10-12시", value: 220000000 },
            { key: "12-14", label: "12-14시", value: 350000000 },
            { key: "14-16", label: "14-16시", value: 280000000 },
            { key: "16-18", label: "16-18시", value: 320000000 },
            { key: "18-20", label: "18-20시", value: 450000000 },
            { key: "20-22", label: "20-22시", value: 380000000 },
            { key: "22-24", label: "22-24시", value: 200000000 }
          ],
          timeMax: { index: 6, label: "18-20시", value: 450000000 },
          timeMin: { index: 0, label: "06-08시", value: 120000000 },
          daySlots: [
            { key: "mon", label: "월요일", value: 280000000 },
            { key: "tue", label: "화요일", value: 320000000 },
            { key: "wed", label: "수요일", value: 310000000 },
            { key: "thu", label: "목요일", value: 340000000 },
            { key: "fri", label: "금요일", value: 420000000 },
            { key: "sat", label: "토요일", value: 480000000 },
            { key: "sun", label: "일요일", value: 390000000 }
          ],
          dayMax: { index: 5, label: "토요일", value: 480000000 },
          dayMin: { index: 0, label: "월요일", value: 280000000 },
          monthlySales: {
            "1월": 200000000,
            "2월": 180000000,
            "3월": 220000000,
            "4월": 240000000,
            "5월": 260000000,
            "6월": 280000000,
          }
        };
        
        if (aborted) return;
        setData(dummyData);
      } catch (e: unknown) {
        if (!aborted) setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [trdarCode]);


  const timeLabels = useMemo(() => data?.timeSlots.map((s) => s.label) ?? [], [data]);
  const timeValues = useMemo(() => data?.timeSlots.map((s) => s.value) ?? [], [data]);
  const timeMaxIndex = data?.timeMax.index ?? null;
  const timeMax = data?.timeMax ?? null;
  const timeMin = data?.timeMin ?? null;

  const dayLabels = useMemo(() => data?.daySlots.map((d) => d.label) ?? [], [data]);
  const dayValues = useMemo(() => data?.daySlots.map((d) => d.value) ?? [], [data]);
  const dayMaxIndex = data?.dayMax.index ?? null;
  const dayMax = data?.dayMax ?? null;
  const dayMin = data?.dayMin ?? null;

  return (
    <div>
      <h3 className="text-[18px] font-semibold text-gray-900">매출</h3>

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
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-gray-900">
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
                <span className="ml-1 font-bold text-rose-500">{data.timeMax.label}</span>
                <span className="ml-1 font-medium">입니다.</span>
              </>
            ) : (
              <>
                <span className="font-medium">매출이 가장 많은 요일은</span>
                <span className="ml-1 font-bold text-rose-500">{data.dayMax?.label ?? "알 수 없음"}</span>
                <span className="ml-1 font-medium">예요.</span>
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
          <div className="border-l border-gray-200 bg-[#3288FF1A] px-4 py-3 text-center text-sm font-semibold text-black">
            {mode === "time" ? "매출이 가장 적은 시간대" : "주말매출금액(건수)"}
          </div>
          <div className="px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMax ? (
                <>
                  <span className="font-semibold">{timeMax.label}</span>
                  {typeof timeMax.value === "number" && (
                    <span className="ml-2 text-gray-500">{formatCurrency(timeMax.value)}</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data ? (
              <>
                <span className="font-semibold">{formatCurrency(data.weekdaySales)}</span>
                <span className="ml-2 text-gray-500">({Math.round(data.weekdaySales / 1000000)}건)</span>
              </>
            ) : (
              <span className="text-gray-500">데이터 없음</span>
            )}
          </div>
          <div className="border-l border-gray-200 px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMin ? (
                <>
                  <span className="font-semibold">{timeMin.label}</span>
                  {typeof timeMin.value === "number" && (
                    <span className="ml-2 text-gray-500">{formatCurrency(timeMin.value)}</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data ? (
              <>
                <span className="font-semibold">{formatCurrency(data.weekendSales)}</span>
                <span className="ml-2 text-gray-500">({Math.round(data.weekendSales / 1000000)}건)</span>
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
            <TimeSlotBarChart labels={timeLabels} values={timeValues} maxIndex={timeMaxIndex} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">차트를 표시할 데이터가 없습니다.</div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-gray-200 p-3 overflow-x-auto">
          {data && dayLabels.length === 7 && dayValues.some((v) => Number.isFinite(v) && v > 0) ? (
            <TimeSlotBarChart labels={dayLabels} values={dayValues} maxIndex={dayMaxIndex} />
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
  if (v >= 1000000000) {
    return `${(v / 1000000000).toFixed(1)}억원`;
  } else if (v >= 100000000) {
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