"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = { trdarCode: string | null };

type ResidentResponse = {
  quarter: string;
  trdarCd: string;
  trdarNm: string;
  totalResident: number;
  householdsTotal: number;
  male: number;
  female: number;
  maleRate: number;
  femaleRate: number;
  aptHouseholds: number;
  nonAptHouseholds: number;
  aptRate: number;
  nonAptRate: number;
  avgHouseholdSize: number;
  age: { [k in "10" | "20" | "30" | "40" | "50" | "60+"]: number };
  topAgeGroup: { key: string; value: number; rate: number };
};

export default function ResidentPopulationCard({ trdarCode }: Props) {
  const [data, setData] = useState<ResidentResponse | null>(null);
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
        const qRes = await fetch("/api/seoul/latest-quarter", { cache: "no-store" });
        if (!qRes.ok) throw new Error("latest-quarter failed");
        const q = (await qRes.json()).quarter as string;
        if (aborted) return;
        setQuarter(q);

        const url = `/api/seoul/trade-areas/residents/detail?quarter=${q}&trdar=${trdarCode}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("residents detail failed");
        const payload = (await res.json()) as ResidentResponse;
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

  const ageList = useMemo(() => {
    const entries: Array<{ label: string; value: number }> = data
      ? [
          { label: "10대", value: data.age["10"] },
          { label: "20대", value: data.age["20"] },
          { label: "30대", value: data.age["30"] },
          { label: "40대", value: data.age["40"] },
          { label: "50대", value: data.age["50"] },
          { label: "60대+", value: data.age["60+"] },
        ]
      : [];
    const max = entries.reduce((m, e) => Math.max(m, e.value), 0);
    return { entries, max };
  }, [data]);

  return (
    <div>
      <h3 className="text-[18px] font-semibold text-gray-900">상주인구</h3>

      {/* Caption */}
      <div className="mt-1 text-right text-xs text-gray-400">{quarter ?? "—"}</div>

      {/* Grid KPIs */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total resident */}
        <KpiTile
          title="총 상주인구"
          primary={data ? `${formatNumber(data.totalResident)}명` : "—"}
          secondary={data ? `남 ${formatPercent(data.maleRate)} · 여 ${formatPercent(data.femaleRate)}` : "—"}
        />
        {/* Households */}
        <KpiTile
          title="총 가구 수"
          primary={data ? `${formatNumber(data.householdsTotal)}가구` : "—"}
          secondary={
            data
              ? Number.isFinite(data.avgHouseholdSize) && data.avgHouseholdSize > 0
                ? `평균 가구원수 ${formatFixed(data.avgHouseholdSize, 1)}명`
                : "—"
              : "—"
          }
        />
        {/* Apt ratio */}
        <KpiTile
          title="아파트 비중"
          primaryClass="text-[#2563EB]"
          primary={data ? `${formatPercent(data.aptRate)}` : "—"}
          secondary={data ? `아파트 ${formatNumber(data.aptHouseholds)} · 비아파트 ${formatNumber(data.nonAptHouseholds)}` : "—"}
        />
      </div>

      {/* Gender and dwelling composition */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">성별 구성</div>
          <div className="mt-2">
            {data ? (
              <SegmentBar
                leftLabel={`남 ${formatPercent(data.maleRate)}`}
                rightLabel={`여 ${formatPercent(data.femaleRate)}`}
                leftRate={clamp01(data.maleRate / 100)}
              />
            ) : (
              <Placeholder />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">주거 유형</div>
          <div className="mt-2">
            {data ? (
              <SegmentBar
                leftColor="#10B981"
                rightColor="#94A3B8"
                leftLabel={`아파트 ${formatPercent(data.aptRate)}`}
                rightLabel={`비아파트 ${formatPercent(data.nonAptRate)}`}
                leftRate={clamp01(data.aptRate / 100)}
              />
            ) : (
              <Placeholder />
            )}
          </div>
        </div>
      </div>

      {/* Age distribution */}
      <div className="mt-4 rounded-2xl border border-gray-200 p-4">
        <div className="text-sm font-semibold text-gray-700">연령대 분포</div>
        <div className="mt-2 space-y-2">
          {data ? (
            ageList.entries.map((e, idx) => (
              <AgeBar
                key={idx}
                label={e.label}
                value={e.value}
                max={Math.max(1, ageList.max)}
                highlight={data.topAgeGroup?.key?.startsWith(e.label.replace("대", ""))}
              />
            ))
          ) : (
            <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">데이터가 없습니다.</div>
          )}
        </div>
      </div>

      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 상주인구를 보여드려요.</div>
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

function SegmentBar({
  leftRate,
  leftLabel,
  rightLabel,
  leftColor = "#3B82F6",
  rightColor = "#EF4444",
}: {
  leftRate: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
}) {
  const leftPct = Math.round(clamp01(leftRate) * 100);
  const rightPct = 100 - leftPct;
  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full" style={{ width: `${leftPct}%`, backgroundColor: leftColor }} />
        <div className="h-full" style={{ width: `${rightPct}%`, backgroundColor: rightColor, marginTop: -12 }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function AgeBar({ label, value, max, highlight = false }: { label: string; value: number; max: number; highlight?: boolean }) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 shrink-0 text-xs text-gray-600 text-right">{label}</div>
      <div className="flex-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: highlight ? "#2563EB" : "#9CA3AF" }} />
        </div>
      </div>
      <div className="w-20 shrink-0 text-right text-xs text-gray-600">{formatNumber(value)}명</div>
    </div>
  );
}

function Placeholder() {
  return <div className="h-3 w-full rounded-full bg-gray-100" />;
}

function formatNumber(v: number) {
  try {
    return v.toLocaleString();
  } catch {
    return String(v);
  }
}

function formatPercent(v: number) {
  const digits = Math.abs(v) < 10 ? 1 : 0;
  return `${v.toFixed(digits)}%`;
}

function formatFixed(v: number, d = 1) {
  return Number.isFinite(v) ? v.toFixed(d) : "—";
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

