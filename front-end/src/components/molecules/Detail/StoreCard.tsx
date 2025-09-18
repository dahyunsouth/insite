"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = { trdarCode: string | null };

type StoreResponse = {
  quarter: string;
  trdarCd: string;
  trdarNm: string;
  storeCount: number;
  similarIndustryStoreCount: number;
  openRate: number;
  openStoreCount: number;
  closeRate: number;
  closeStoreCount: number;
  netChange: number;
};

type LatestQuarterResponse = {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: string;
};

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://43.203.196.29:8080").replace(/\/+$/, "");
const LATEST_QUARTER_ENDPOINT = `${BACKEND_BASE_URL}/api/v1/data/latest-quarter`;

export default function StoreCard({ trdarCode }: Props) {
  const [data, setData] = useState<StoreResponse | null>(null);
  const [quarter, setQuarter] = useState<string | null>(null);
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
        const qRes = await fetch(LATEST_QUARTER_ENDPOINT, { cache: "no-store" });
        if (!qRes.ok) throw new Error("latest-quarter failed");
        const qJson = (await qRes.json()) as LatestQuarterResponse;
        if (!qJson?.isSuccess || qJson?.httpStatus !== "OK" || typeof qJson?.result !== "string") {
          throw new Error("latest-quarter payload invalid");
        }
        const q = qJson.result;
        if (aborted) return;
        setQuarter(q);

        const url = `/api/seoul/trade-areas/stores/detail?quarter=${q}&trdar=${trdarCode}&svc=CS100010`;
        const sRes = await fetch(url, { cache: "no-store" });
        if (!sRes.ok) throw new Error("stores detail failed");
        const s = (await sRes.json()) as StoreResponse;
        if (aborted) return;
        setData(s);
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

  const netBadge = useMemo(() => {
    const v = data?.netChange ?? 0;
    const positive = v > 0;
    const negative = v < 0;
    const cls = positive
      ? "bg-emerald-50 text-emerald-700"
      : negative
      ? "bg-rose-50 text-rose-700"
      : "bg-gray-100 text-gray-600";
    const sign = positive ? "+" : negative ? "" : "";
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
        {positive ? "↑" : negative ? "↓" : "→"}
        <span className="ml-1">순증감 {sign}{formatNumber(Math.abs(v))}개</span>
      </span>
    );
  }, [data]);

  return (
    <div className="mt-2">
      <h3 className="text-[18px] font-semibold text-gray-900">점포</h3>

      {/* Caption */}
      {/* <div className="mt-1 text-right text-xs text-gray-400">{quarter ?? "—"}</div> */}

      {/* Net change badge */}
      <div className="mt-3">{data ? netBadge : null}</div>

      {/* Grid KPIs */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stores */}
        <KpiTile
          title="점포"
          primary={data ? `${formatNumber(data.storeCount)}개` : "—"}
          secondary={data ? `유사 업종 ${formatNumber(data.similarIndustryStoreCount)}개` : "—"}
        />
        {/* Open */}
        <KpiTile
          title="개업"
          primaryClass="text-emerald-600"
          primary={data ? `${formatPercent(data.openRate)}` : "—"}
          secondary={data ? `${formatNumber(data.openStoreCount)}개` : "—"}
        />
        {/* Close */}
        <KpiTile
          title="폐업"
          primaryClass="text-rose-600"
          primary={data ? `${formatPercent(data.closeRate)}` : "—"}
          secondary={data ? `${formatNumber(data.closeStoreCount)}개` : "—"}
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

function formatNumber(v: number) {
  return v.toLocaleString();
}

function formatPercent(v: number) {
  // keep one decimal place when < 10%, otherwise 0 decimal
  const digits = Math.abs(v) < 10 ? 1 : 0;
  return `${v.toFixed(digits)}%`;
}
