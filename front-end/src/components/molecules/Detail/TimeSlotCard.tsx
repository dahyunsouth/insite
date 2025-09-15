"use client";

import React, { useEffect, useMemo, useState } from "react";
import TimeSlotBarChart from "@/components/molecules/Detail/Chart/TimeSlotBarChart";

type Props = { trdarCode: string | null };

type DetailResponse = {
  quarter: string;
  trdarCd: string;
  trdarNm: string;
  slots: { key: string; label: string; value: number }[];
  max: { index: number; label: string; value: number };
  // Weekday fields are optional – API may include them
  days?: { key: string; label: string; value: number }[];
  dayMax?: { index: number; label: string; value: number };
  dayMin?: { index: number; label: string; value: number };
};

export default function TimeSlotCard({ trdarCode }: Props) {
  const [quarter, setQuarter] = useState<string | null>(null);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"time" | "dow">("time");

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
        // get latest quarter
        const qRes = await fetch("/api/seoul/latest-quarter", { cache: "no-store" });
        if (!qRes.ok) throw new Error("latest-quarter failed");
        const q = (await qRes.json()).quarter as string;
        if (aborted) return;
        setQuarter(q);

        const dRes = await fetch(`/api/seoul/trade-areas/detail?quarter=${q}&trdar=${trdarCode}`, { cache: "no-store" });
        if (!dRes.ok) throw new Error("detail failed");
        const d = (await dRes.json()) as DetailResponse;
        if (aborted) return;
        setData(d);
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

  const labels = useMemo(() => data?.slots.map((s) => s.label) ?? [], [data]);
  const values = useMemo(() => data?.slots.map((s) => s.value) ?? [], [data]);
  const maxIndex = data?.max.index ?? null;
  const timeMax = data?.max ?? null;
  const timeMin = useMemo(() => {
    if (!data?.slots || data.slots.length === 0) return null;
    let bestIdx = 0;
    for (let i = 1; i < data.slots.length; i++) {
      if (data.slots[i].value < data.slots[bestIdx].value) bestIdx = i;
    }
    const slot = data.slots[bestIdx];
    return { index: bestIdx, label: slot.label, value: slot.value };
  }, [data]);

  const dayLabels = useMemo(() => data?.days?.map((d) => d.label) ?? [], [data]);
  const dayValues = useMemo(() => data?.days?.map((d) => d.value) ?? [], [data]);
  const dayMaxIndex = data?.dayMax?.index ?? null;

  return (
    <div>
      <h3 className="text-[18px] font-semibold text-gray-900">유동인구</h3>

      {/* Segmented control: 시간대별 / 요일별 */}
      <div className="mt-4 w-full rounded-xl bg-gray-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode("time")}
            aria-pressed={mode === "time"}
            className={
              `w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "time" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            시간대별 추이
          </button>
          <button
            type="button"
            onClick={() => setMode("dow")}
            aria-pressed={mode === "dow"}
            className={
              `w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "dow" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            요일별 추이
          </button>
        </div>
      </div>

      {/* Highlight */}
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-gray-900">
        {trdarCode == null ? (
          <span className="text-gray-500">상권을 선택하면 시간대별 유동인구를 보여드려요.</span>
        ) : loading ? (
          <span className="text-gray-500">불러오는 중…</span>
        ) : error ? (
          <span className="text-rose-600">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</span>
        ) : data ? (
          <>
            {mode === "time" ? (
              <>
                <span className="font-medium">유동인구가 가장 많은 시간대는</span>
                <span className="ml-1 font-bold text-rose-500">{data.max.label}</span>
                <span className="ml-1 font-medium">예요.</span>
              </>
            ) : (
              <>
                <span className="font-medium">유동인구가 가장 많은 요일은</span>
                <span className="ml-1 font-bold text-rose-500">{data.dayMax?.label ?? "알 수 없음"}</span>
                <span className="ml-1 font-medium">예요.</span>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-500">데이터가 없습니다.</span>
        )}
      </div>

      {/* 선택 모드별 최다/최소 표 (Highlight와 Chart 사이) */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
        <div className="grid grid-cols-2">
          <div className="bg-[#3288FF1A] px-4 py-3 text-center text-sm font-semibold text-black">
            {mode === "time" ? "유동인구가 가장 많은 시간대" : "유동인구가 가장 많은 요일"}
          </div>
          <div className="border-l border-gray-200 bg-[#3288FF1A] px-4 py-3 text-center text-sm font-semibold text-black">
            {mode === "time" ? "유동인구가 가장 적은 시간대" : "유동인구가 가장 적은 요일"}
          </div>
          <div className="px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMax ? (
                <>
                  <span className="font-semibold">{timeMax.label}</span>
                  {typeof timeMax.value === "number" && (
                    <span className="ml-2 text-gray-500">{timeMax.value.toLocaleString()}명</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data?.dayMax ? (
              <>
                <span className="font-semibold">{data.dayMax.label}</span>
                {typeof data.dayMax.value === "number" && (
                  <span className="ml-2 text-gray-500">{data.dayMax.value.toLocaleString()}명</span>
                )}
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
                    <span className="ml-2 text-gray-500">{timeMin.value.toLocaleString()}명</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data?.dayMin ? (
              <>
                <span className="font-semibold">{data.dayMin.label}</span>
                {typeof data.dayMin.value === "number" && (
                  <span className="ml-2 text-gray-500">{data.dayMin.value.toLocaleString()}명</span>
                )}
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
          {data && labels.length === 6 ? (
            <TimeSlotBarChart labels={labels} values={values} maxIndex={maxIndex} />
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
    </div>
  );
}
