"use client";

import React from "react";

type Props = {
  labels: string[]; // 7 labels (요일)
  values: number[]; // 7 values
  maxIndex?: number | null;
  className?: string;
};

export default function FloatingPopulationWeekChart({ labels, values, maxIndex = null, className }: Props) {
  const W = 560;
  const H = 260;
  const m = { top: 16, right: 12, bottom: 20, left: 60 };
  const cw = W - m.left - m.right;
  const ch = H - m.top - m.bottom;

  const n = values.length;
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const maxVal = Math.max(dataMax, 1); // Ensure we have at least 1 for scaling
  const scaleY = (v: number) => ch - (v / maxVal) * ch;
  const band = cw / (n * 1.4);
  const gap = band * 0.4;

  // Dynamic colors: highest -> blue, lowest -> red, others -> gray
  const BLUE = "#3288FF";
  const RED = "#ef4444";
  const GRAY = "#9CA3AF";
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  const colorByIndex: string[] = values.map((v) => {
    if (v === maxValue) return BLUE;
    if (v === minValue) return RED;
    return GRAY;
  });


  // Custom tick values with equal spacing: 0, 1/4 * max, 2/4 * max, 3/4 * max, max
  const tickVals = [
    0,
    dataMax / 4,
    dataMax / 2,
    (3 * dataMax) / 4,
    dataMax
  ];

  return (
    <div className={(className ? `flex justify-center ${className}` : "flex justify-center")}>
      <svg width={W} height={H} role="img" aria-label="요일별 유동인구 막대 차트">
        {/* grid & axes */}
        {tickVals.map((tv, i) => {
          const y = m.top + scaleY(tv);
          return (
            <g key={i}>
              <line x1={m.left} y1={y} x2={W - m.right} y2={y} stroke="#E5E7EB" strokeDasharray="2,2" />
              <text x={m.left - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontSize={11} fill="#6B7280">
                {formatNumber(tv)}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {values.map((v, i) => {
          const x = m.left + i * (band + gap);
          const y = m.top + scaleY(v);
          const h = m.top + ch - y;
          return (
            <g key={i}>
              <rect x={x} y={y} width={band} height={h} fill={colorByIndex[i]} rx={4} />
              <title>
                {labels[i]}: {formatNumber(v)}
              </title>
            </g>
          );
        })}


        {/* x labels */}
        {labels.map((lb, i) => {
          const x = m.left + i * (band + gap) + band / 2;
          const y = H - m.bottom + 16;
          return (
            <text key={lb} x={x} y={y} textAnchor="middle" fontSize={11} fill="#6B7280">
              {lb}
            </text>
          );
        })}

        {/* max marker */}
        {maxIndex != null && maxIndex >= 0 && (
          <g>
            {(() => {
              const x = m.left + maxIndex * (band + gap) + band / 2;
              const y = m.top + scaleY(values[maxIndex]);
              return (
                <>
                  <line x1={x} y1={y - 8} x2={x} y2={m.top + ch} stroke="#9CA3AF" strokeDasharray="2,4" />
                  <polygon points={`${x},${y - 14} ${x - 6},${y - 4} ${x + 6},${y - 4}`} fill="#F97316" />
                </>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}

function formatNumber(v: number) {
  // show in 만명 when >= 10000
  if (v >= 10000) {
    const x = v / 10000;
    return `${x.toFixed(x >= 10 ? 0 : 1)}만명`;
  }
  return `${v.toLocaleString()}명`;
}
