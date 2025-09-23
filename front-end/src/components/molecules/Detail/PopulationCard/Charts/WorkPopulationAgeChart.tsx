"use client";

import React, { useState } from "react";
import ToolTip from "./ToolTip";
import Image from "next/image";

type Props = {
  data: {
    agrde10WrcPopltnCo: number;
    agrde20WrcPopltnCo: number;
    agrde30WrcPopltnCo: number;
    agrde40WrcPopltnCo: number;
    agrde50WrcPopltnCo: number;
    agrde60AboveWrcPopltnCo: number;
    mag10WrcPopltnCo: number;
    mag20WrcPopltnCo: number;
    mag30WrcPopltnCo: number;
    mag40WrcPopltnCo: number;
    mag50WrcPopltnCo: number;
    mag60AboveWrcPopltnCo: number;
    fag10WrcPopltnCo: number;
    fag20WrcPopltnCo: number;
    fag30WrcPopltnCo: number;
    fag40WrcPopltnCo: number;
    fag50WrcPopltnCo: number;
    fag60AboveWrcPopltnCo: number;
    totWrcPopltnCo: number;
  } | null;
};

export default function WorkPopulationAgeChart({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ isVisible: boolean; position: { x: number; y: number }; label: string; value: string }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    label: "",
    value: ""
  });

  const ageGroups = [
    { label: "10대", total: data?.agrde10WrcPopltnCo || 0, male: data?.mag10WrcPopltnCo || 0, female: data?.fag10WrcPopltnCo || 0 },
    { label: "20대", total: data?.agrde20WrcPopltnCo || 0, male: data?.mag20WrcPopltnCo || 0, female: data?.fag20WrcPopltnCo || 0 },
    { label: "30대", total: data?.agrde30WrcPopltnCo || 0, male: data?.mag30WrcPopltnCo || 0, female: data?.fag30WrcPopltnCo || 0 },
    { label: "40대", total: data?.agrde40WrcPopltnCo || 0, male: data?.mag40WrcPopltnCo || 0, female: data?.fag40WrcPopltnCo || 0 },
    { label: "50대", total: data?.agrde50WrcPopltnCo || 0, male: data?.mag50WrcPopltnCo || 0, female: data?.fag50WrcPopltnCo || 0 },
    { label: "60대+", total: data?.agrde60AboveWrcPopltnCo || 0, male: data?.mag60AboveWrcPopltnCo || 0, female: data?.fag60AboveWrcPopltnCo || 0 },
  ];

  const maxAgeGroupTotal = Math.max(...ageGroups.map(group => group.total));

  return (
    <div className="rounded-2xl border border-gray-200 p-4 relative">
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
              totalPopulation={data.totWrcPopltnCo}
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
