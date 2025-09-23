"use client";

import React from "react";
import Image from "next/image";

type Props = {
  data: {
    totHshldCo: number;
    aptHshldCo: number;
    nonAptHshldCo: number;
  } | null;
};

export default function ResidentPopulationHomeTypeChart({ data }: Props) {
  const aptRate = data && data.totHshldCo > 0 ? (data.aptHshldCo / data.totHshldCo) * 100 : 0;
  const nonAptRate = data && data.totHshldCo > 0 ? (data.nonAptHshldCo / data.totHshldCo) * 100 : 0;
  const isAptMajority = aptRate > nonAptRate;

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="text-sm font-semibold text-gray-700">주거 유형</div>
      <div className="mt-2">
        {data ? (
          <SegmentBar
            leftColor="#10B981"
            rightColor="#94A3B8"
            leftLabel={`아파트 ${formatPercent(aptRate)}`}
            rightLabel={`비아파트 ${formatPercent(nonAptRate)}`}
            leftRate={clamp01(aptRate / 100)}
            isAptMajority={isAptMajority}
          />
        ) : (
          <Placeholder />
        )}
      </div>
    </div>
  );
}

function SegmentBar({
  leftRate,
  leftLabel,
  rightLabel,
  leftColor = "#10B981",
  rightColor = "#94A3B8",
  isAptMajority,
}: {
  leftRate: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  isAptMajority: boolean;
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
        <div className="flex items-center gap-1">
          {isAptMajority && (
            <Image 
              src="/images/ic_crown.png" 
              alt="crown" 
              width={12} 
              height={12}
            />
          )}
          <span>{leftLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isAptMajority && (
            <Image 
              src="/images/ic_crown.png" 
              alt="crown" 
              width={12} 
              height={12}
            />
          )}
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Placeholder() {
  return <div className="h-3 w-full rounded-full bg-gray-100" />;
}

function formatPercent(v: number) {
  const digits = Math.abs(v) < 10 ? 1 : 0;
  return `${v.toFixed(digits)}%`;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
