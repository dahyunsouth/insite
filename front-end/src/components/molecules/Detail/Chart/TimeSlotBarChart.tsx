"use client";

import React from "react";

type Props = {
  labels: string[]; // 6 labels
  values: number[]; // 6 values
  maxIndex?: number | null;
  className?: string;
};

export default function TimeSlotBarChart({ labels, values, maxIndex = null, className }: Props) {
  const W = 560;
  const H = 260;
  const m = { top: 16, right: 12, bottom: 20, left: 60 };
  const cw = W - m.left - m.right;
  const ch = H - m.top - m.bottom;

  const n = values.length;
  const maxVal = Math.max(1, ...values);
  const scaleY = (v: number) => ch - (v / maxVal) * ch;
  const band = cw / (n * 1.4);
  const gap = band * 0.4;

  // Dynamic colors by ranking: bottom 2 -> green, middle 2 -> orange, top 2 -> red
  const GREEN = "#22c55e";
  const ORANGE = "#fb923c";
  const RED = "#ef4444";
  const orderAsc = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
    .map((o) => o.i);
  const colorByIndex: string[] = new Array(n).fill(ORANGE);
  for (let j = 0; j < Math.min(2, n); j++) colorByIndex[orderAsc[j]] = GREEN; // lowest 2
  for (let j = 0; j < Math.min(2, n); j++) colorByIndex[orderAsc[n - 1 - j]] = RED; // highest 2

  const points = values.map((v, i) => {
    const x = m.left + i * (band + gap) + band / 2;
    const y = m.top + scaleY(v);
    return `${x},${y}`;
  });

  const ticks = 4; // 0, 25, 50, 75, 100% of max
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round((maxVal * i) / ticks));

  return (
    <div className={(className ? `flex justify-center ${className}` : "flex justify-center")}>
      <svg width={W} height={H} role="img" aria-label="시간대별 유동인구 막대 차트">
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

        {/* dashed trend line */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#60A5FA"
          strokeDasharray="6,4"
          strokeWidth={2}
        />

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
