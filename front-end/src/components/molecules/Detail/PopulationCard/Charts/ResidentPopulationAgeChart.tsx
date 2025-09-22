"use client";

import React, { useState } from "react";
import ToolTip from "./ToolTip";
import Image from "next/image";

type Props = {
  data: {
    agrde10RepopCo: number;
    agrde20RepopCo: number;
    agrde30RepopCo: number;
    agrde40RepopCo: number;
    agrde50RepopCo: number;
    agrde60AboveRepopCo: number;
    mag10RepopCo: number;
    mag20RepopCo: number;
    mag30RepopCo: number;
    mag40RepopCo: number;
    mag50RepopCo: number;
    mag60AboveRepopCo: number;
    fag10RepopCo: number;
    fag20RepopCo: number;
    fag30RepopCo: number;
    fag40RepopCo: number;
    fag50RepopCo: number;
    fag60AboveRepopCo: number;
    totRepopCo: number;
  } | null;
};

export default function ResidentPopulationAgeChart({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ isVisible: boolean; position: { x: number; y: number }; label: string; value: string }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    label: "",
    value: ""
  });

  const ageGroups = [
    { label: "10대", total: data?.agrde10RepopCo || 0, male: data?.mag10RepopCo || 0, female: data?.fag10RepopCo || 0 },
    { label: "20대", total: data?.agrde20RepopCo || 0, male: data?.mag20RepopCo || 0, female: data?.fag20RepopCo || 0 },
    { label: "30대", total: data?.agrde30RepopCo || 0, male: data?.mag30RepopCo || 0, female: data?.fag30RepopCo || 0 },
    { label: "40대", total: data?.agrde40RepopCo || 0, male: data?.mag40RepopCo || 0, female: data?.fag40RepopCo || 0 },
    { label: "50대", total: data?.agrde50RepopCo || 0, male: data?.mag50RepopCo || 0, female: data?.fag50RepopCo || 0 },
    { label: "60대+", total: data?.agrde60AboveRepopCo || 0, male: data?.mag60AboveRepopCo || 0, female: data?.fag60AboveRepopCo || 0 },
  ];

  const maxAgeGroupTotal = Math.max(...ageGroups.map(group => group.total));

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 p-4 relative">
      <div className="text-sm font-semibold text-gray-700">연령대 분포</div>
      <div className="mt-2 space-y-2">
        {data ? (
          ageGroups.map((group, idx) => (
            <AgeBar
              key={idx}
              label={group.label}
              total={group.total}
              male={group.male}
              female={group.female}
              maxTotal={maxAgeGroupTotal}
              totalPopulation={data.totRepopCo}
              isMax={group.total === maxAgeGroupTotal}
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
                    value: `${formatNumber(group.male)}명`
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
                    value: `${formatNumber(group.female)}명`
                  });
                }
              }}
              onMouseLeave={() => {
                setTooltip(prev => ({ ...prev, isVisible: false }));
              }}
            />
          ))
        ) : (
          <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">
            데이터가 없습니다.
          </div>
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

function AgeBar({ 
  label, 
  total, 
  male, 
  female, 
  maxTotal,
  totalPopulation,
  isMax,
  onMaleHover,
  onFemaleHover,
  onMouseLeave
}: { 
  label: string; 
  total: number; 
  male: number; 
  female: number; 
  maxTotal: number;
  totalPopulation: number;
  isMax: boolean;
  onMaleHover?: (e: React.MouseEvent) => void;
  onFemaleHover?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}) {
  const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const totalPercent = totalPopulation > 0 ? (total / totalPopulation) * 100 : 0;
  const malePercent = total > 0 ? (male / total) * 100 : 0;
  const femalePercent = total > 0 ? (female / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3" onMouseLeave={onMouseLeave}>
      <div className="w-12 shrink-0 text-xs text-gray-600 text-right">{label}</div>
      <div className="flex-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div 
            className="h-full flex" 
            style={{ width: `${barWidth}%` }}
          >
            {/* 남성 부분 (왼쪽에서) */}
            <div 
              className="h-full cursor-pointer" 
              style={{ 
                width: `${malePercent}%`, 
                backgroundColor: "#3288FF",
                borderTopLeftRadius: "6px",
                borderBottomLeftRadius: "6px"
              }}
              onMouseEnter={onMaleHover}
            />
            {/* 여성 부분 (오른쪽에서) */}
            <div 
              className="h-full cursor-pointer" 
              style={{ 
                width: `${femalePercent}%`, 
                backgroundColor: "#FF9CBC",
                borderTopRightRadius: "6px",
                borderBottomRightRadius: "6px"
              }}
              onMouseEnter={onFemaleHover}
            />
          </div>
        </div>
      </div>
      <div className="w-12 shrink-0 flex justify-center items-center">
        {isMax && (
          <div className="flex items-center gap-1">
            <Image 
              src="/images/ic_crown.png" 
              alt="crown" 
              width={12} 
              height={12}
            />
            <span className="text-xs font-semibold text-black">Max</span>
          </div>
        )}
      </div>
      <div className="w-20 shrink-0 text-right text-xs text-gray-600">
        {formatPercent(totalPercent)} ({formatNumber(total)}명)
      </div>
    </div>
  );
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