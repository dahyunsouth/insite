"use client";

import React, { useState } from "react";
import ToolTip from "./ToolTip";
import Image from "next/image";

type Props = {
  data: {
    totRepopCo: number;
    mlRepopCo: number;
    fmlRepopCo: number;
  } | null;
};

export default function ResidentPopulationGenderChart({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ isVisible: boolean; position: { x: number; y: number }; label: string; value: string }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    label: "",
    value: ""
  });

  const maleRate = data && data.totRepopCo > 0 ? (data.mlRepopCo / data.totRepopCo) * 100 : 0;
  const femaleRate = data && data.totRepopCo > 0 ? (data.fmlRepopCo / data.totRepopCo) * 100 : 0;
  const isMaleMajority = maleRate > femaleRate;

  return (
    <div className="rounded-2xl border border-gray-200 p-4 relative">
      <div className="text-sm font-semibold text-gray-700">성별 구성</div>
      <div className="mt-2">
        {data ? (
          <SegmentBar
            leftLabel={`남 ${formatPercent(maleRate)}`}
            rightLabel={`여 ${formatPercent(femaleRate)}`}
            leftRate={clamp01(maleRate / 100)}
            leftColor="#3288FF"
            rightColor="#FF9CBC"
            isMaleMajority={isMaleMajority}
            onMaleHover={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const containerRect = e.currentTarget.closest('.rounded-2xl')?.getBoundingClientRect();
              if (containerRect) {
                setTooltip({
                  isVisible: true,
                  position: { 
                    x: rect.left - containerRect.left + rect.width / 4, 
                    y: rect.top - containerRect.top
                  },
                  label: "남성",
                  value: `${formatNumber(data.mlRepopCo)}명`
                });
              }
            }}
            onFemaleHover={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const containerRect = e.currentTarget.closest('.rounded-2xl')?.getBoundingClientRect();
              if (containerRect) {
                setTooltip({
                  isVisible: true,
                  position: { 
                    x: rect.left - containerRect.left + (rect.width * 3) / 4, 
                    y: rect.top - containerRect.top
                  },
                  label: "여성",
                  value: `${formatNumber(data.fmlRepopCo)}명`
                });
              }
            }}
            onMouseLeave={() => {
              setTooltip(prev => ({ ...prev, isVisible: false }));
            }}
          />
        ) : (
          <Placeholder />
        )}
      </div>
      <ToolTip
        isVisible={tooltip.isVisible}
        position={tooltip.position}
        label={tooltip.label}
        value={tooltip.value}
      />
    </div>
  );
}

function SegmentBar({
  leftRate,
  leftLabel,
  rightLabel,
  leftColor = "#3288FF",
  rightColor = "#FF9CBC",
  isMaleMajority,
  onMaleHover,
  onFemaleHover,
  onMouseLeave,
}: {
  leftRate: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  isMaleMajority: boolean;
  onMaleHover?: (e: React.MouseEvent) => void;
  onFemaleHover?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}) {
  const leftPct = Math.round(clamp01(leftRate) * 100);
  const rightPct = 100 - leftPct;
  return (
    <div onMouseLeave={onMouseLeave}>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full flex">
          <div 
            className="h-full cursor-pointer" 
            style={{ width: `${leftPct}%`, backgroundColor: leftColor }} 
            onMouseEnter={onMaleHover}
          />
          <div 
            className="h-full cursor-pointer" 
            style={{ width: `${rightPct}%`, backgroundColor: rightColor }} 
            onMouseEnter={onFemaleHover}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1">
          {isMaleMajority && (
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
          {!isMaleMajority && (
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

function formatNumber(v: number) {
  try {
    return v.toLocaleString();
  } catch {
    return String(v);
  }
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
