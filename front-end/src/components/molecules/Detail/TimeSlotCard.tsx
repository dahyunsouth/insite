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
};

export default function TimeSlotCard({ trdarCode }: Props) {
  const [quarter, setQuarter] = useState<string | null>(null);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <h3 className="text-[18px] font-semibold text-gray-900">유동인구 시간대별 추이</h3>

      {/* Segmented control mimic, time-mode only for now */}
      <div className="mt-4 w-full rounded-xl bg-gray-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button className="w-full justify-center rounded-xl bg-white px-4 py-4 text-sm font-medium text-[#3288FF] shadow-sm">시간대별 추이</button>
          <button className="w-full justify-center rounded-xl px-4 py-4 text-sm font-medium text-gray-400" disabled>요일별 추이(준비중)</button>
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
            <span className="font-medium">유동인구가 가장 많은 시간대는</span>
            <span className="ml-1 font-bold text-rose-500">{data.max.label}</span>
            <span className="ml-1 font-medium">예요.</span>
          </>
        ) : (
          <span className="text-gray-500">데이터가 없습니다.</span>
        )}
      </div>

      {/* Chart */}
      <div className="mt-4 rounded-2xl border border-gray-200 p-3 overflow-x-auto">
        {data && labels.length === 6 ? (
          <TimeSlotBarChart labels={labels} values={values} maxIndex={maxIndex} />
        ) : (
          <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">차트를 표시할 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

