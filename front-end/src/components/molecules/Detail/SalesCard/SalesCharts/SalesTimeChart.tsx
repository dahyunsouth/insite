"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import ToolTip from "@/components/molecules/Detail/PopulationCard/Charts/ToolTip";

type Props = {
  labels: string[];
  values: number[];
  counts: number[];
  maxIndex: number | null;
  className?: string;
};

export default function SalesTimeChart({ labels, values, counts, maxIndex = null, className }: Props) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0); // bars + line animation progress
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION_MS = 800;
  const clipId = useId();
  const W = 560;
  const H = 260;
  const m = { top: 32, right: 60, bottom: 20, left: 60 };
  const cw = W - m.left - m.right;
  const ch = H - m.top - m.bottom;

  const n = values.length;
  const maxVal = Math.max(1, ...values);
  const maxCount = Math.max(1, ...counts);
  const scaleY = (v: number) => ch - (v / maxVal) * ch;
  
  // Right Y-axis scaling - same logic as left axis
  const countMaxValue = Math.max(...counts);
  const countMinValue = Math.min(...counts);
  const scaleCountY = (v: number) => {
    if (countMaxValue === countMinValue) return ch;
    // Use the same complex scaling logic as the bars
    let ratio;
    if (v <= 0) {
      ratio = 0;
    } else if (v <= countMinValue) {
      ratio = (v / countMinValue) * 0.25;
    } else if (v <= countMinValue + (countMaxValue - countMinValue) / 3) {
      const segmentRatio = (v - countMinValue) / ((countMaxValue - countMinValue) / 3);
      ratio = 0.25 + segmentRatio * 0.25;
    } else if (v <= countMinValue + (2 * (countMaxValue - countMinValue)) / 3) {
      const segmentRatio = (v - (countMinValue + (countMaxValue - countMinValue) / 3)) / ((countMaxValue - countMinValue) / 3);
      ratio = 0.5 + segmentRatio * 0.25;
    } else {
      const segmentRatio = (v - (countMinValue + (2 * (countMaxValue - countMinValue)) / 3)) / ((countMaxValue - countMinValue) / 3);
      ratio = 0.75 + segmentRatio * 0.25;
    }
    return ch - ratio * ch;
  };
  const band = cw / (n * 1.4);
  const gap = band * 0.4;

  // Right Y-axis tick values for counts - same logic as left axis
  const countTickVals = [
    0,
    countMinValue,
    countMinValue + (countMaxValue - countMinValue) / 3,
    countMinValue + (2 * (countMaxValue - countMinValue)) / 3,
    countMaxValue
  ];

  // Dynamic colors: max -> blue, min -> red, ranks 2~5 -> progressively lighter grays
  const BLUE = "#3288FF";
  const RED = "#ef4444";
  const GRAY = "#9CA3AF"; // fallback
  const GRAY_2 = "#AEB4BF"; // rank 2
  const GRAY_3 = "#C3CAD4"; // rank 3
  const GRAY_4 = "#D7DCE3"; // rank 4
  const GRAY_5 = "#E6E9EE"; // rank 5
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  const sortedIndices = [...Array(n).keys()].sort((a, b) => values[b] - values[a]);
  const rankByIndex: number[] = Array(n).fill(0);
  sortedIndices.forEach((idx, i) => { rankByIndex[idx] = i + 1; });
  const rankToGray: Record<number, string> = { 2: GRAY_2, 3: GRAY_3, 4: GRAY_4, 5: GRAY_5 };
  const colorByIndex: string[] = values.map((v, i) => {
    if (v === maxValue) return BLUE;
    if (v === minValue) return RED;
    const rank = rankByIndex[i];
    if (rank >= 2 && rank <= 5) return rankToGray[rank];
    return GRAY;
  });

  // Custom tick values: 0, min, min + diff/3, min + 2*diff/3, max
  const tickVals = [
    0,
    minValue,
    minValue + (maxValue - minValue) / 3,
    minValue + (2 * (maxValue - minValue)) / 3,
    maxValue
  ];

  // animate bars and line on data change
  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / DURATION_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [values.join(","), counts.join(",")]);

  return (
    <div className={(className ? `flex justify-center ${className}` : "flex justify-center")}>
      <div className="relative">
        <svg width={W} height={H} role="img" aria-label="시간대별 매출 막대 차트">
        {/* grid & axes */}
        <defs>
          <clipPath id={clipId}>
            <rect x={m.left} y={m.top - 8} width={Math.max(0, progress * cw)} height={ch + 16} />
          </clipPath>
        </defs>
        {tickVals.map((tv, i) => {
          // Equal vertical spacing: divide chart height into 4 equal parts, reverse order (0 at bottom)
          const y = m.top + ch - (i / 4) * ch;
          return (
            <g key={i}>
              <line x1={m.left} y1={y} x2={W - m.right} y2={y} stroke="#E5E7EB" strokeDasharray="2,2" />
              <text x={m.left - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontSize={11} fill="#6B7280">
                {formatNumber(tv)}
              </text>
            </g>
          );
        })}

        {/* right Y-axis for counts */}
        {countTickVals.map((tv, i) => {
          const y = m.top + ch - (i / 4) * ch;
          return (
            <g key={`count-${i}`}>
              <text x={W - m.right + 8} y={y} textAnchor="start" alignmentBaseline="middle" fontSize={11} fill="#6B7280">
                {formatCount(tv)}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {values.map((v, i) => {
          const x = m.left + i * (band + gap);
          
          // Calculate bar position based on Y-axis tick values
          // Map data value to the tick scale: 0, min, min+diff/3, min+2*diff/3, max
          let ratio;
          if (v <= 0) {
            ratio = 0;
          } else if (v <= minValue) {
            // Between 0 and minValue: map to 0-1/4 of chart height
            ratio = (v / minValue) * 0.25;
          } else if (v <= minValue + (maxValue - minValue) / 3) {
            // Between minValue and 1/3 point: map to 1/4-2/4 of chart height
            const segmentRatio = (v - minValue) / ((maxValue - minValue) / 3);
            ratio = 0.25 + segmentRatio * 0.25;
          } else if (v <= minValue + (2 * (maxValue - minValue)) / 3) {
            // Between 1/3 and 2/3 point: map to 2/4-3/4 of chart height
            const segmentRatio = (v - (minValue + (maxValue - minValue) / 3)) / ((maxValue - minValue) / 3);
            ratio = 0.5 + segmentRatio * 0.25;
          } else {
            // Between 2/3 point and maxValue: map to 3/4-4/4 of chart height
            const segmentRatio = (v - (minValue + (2 * (maxValue - minValue)) / 3)) / ((maxValue - minValue) / 3);
            ratio = 0.75 + segmentRatio * 0.25;
          }
          // apply animation progress
          const animatedRatio = ratio * progress;
          const barY = m.top + ch - animatedRatio * ch;
          const barHeight = animatedRatio * ch;
          
          const isMaxValue = v === maxValue;
          const isMinValue = v === minValue;
          
          return (
            <g key={i}>
              {v <= 0 ? null : (
                <rect 
                  x={x} 
                  y={barY} 
                  width={band} 
                  height={barHeight} 
                  fill={colorByIndex[i]} 
                  rx={4}
                  onMouseEnter={(e) => {
                    setHoveredBar(i);
                    const rect = e.currentTarget.getBoundingClientRect();
                    const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                    if (svgRect) {
                      setMousePosition({
                        x: (rect.left + rect.width / 2) - svgRect.left,
                        y: rect.top - svgRect.top  // 툴팁 하단이 막대 최상단과 맞도록
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {isMaxValue && barHeight > 30 && (
                <text
                  x={x + band / 2}
                  y={barY + 20}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  fill="white"
                >
                  Max
                </text>
              )}
              {isMinValue && barHeight > 30 && (
                <text
                  x={x + band / 2}
                  y={barY + 20}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  fill="white"
                >
                  Min
                </text>
              )}
            </g>
          );
        })}

        {/* line chart for counts (dashed) and points with progressive reveal via clip */}
        <g clipPath={`url(#${clipId})`}>
          <path
            d={`M ${m.left + band/2} ${m.top + scaleCountY(counts[0])} ${counts.map((_, i) => {
              const x = m.left + i * (band + gap) + band / 2;
              const y = m.top + scaleCountY(counts[i]);
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#000000"
            strokeWidth="1"
            strokeDasharray="3,2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {counts.map((count, i) => {
            const x = m.left + i * (band + gap) + band / 2;
            const y = m.top + scaleCountY(count);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#000000"
                onMouseEnter={(e) => {
                  setHoveredBar(i);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                  if (svgRect) {
                    setMousePosition({
                      x: (rect.left + rect.width / 2) - svgRect.left,
                      y: rect.top - svgRect.top
                    });
                  }
                }}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </g>

        {/* x labels */}
        {labels.map((lb, i) => {
          const x = m.left + i * (band + gap) + band / 2;
          const y = H - m.bottom + 16;
          const valueAtIndex = values[i];
          const isMax = valueAtIndex === maxValue;
          const isMin = valueAtIndex === minValue;
          const labelColor = isMax ? BLUE : (isMin ? RED : "#6B7280");
          return (
            <text key={lb} x={x} y={y} textAnchor="middle" fontSize={11} fill={labelColor} fontWeight={(isMax || isMin) ? "bold" : "normal"}>
              {lb}
            </text>
          );
        })}

        {/* max marker */}
        {maxIndex != null && maxIndex >= 0 && progress >= 0.999 && (
          <g>
            {(() => {
              const x = m.left + maxIndex * (band + gap) + band / 2;
              const y = m.top + scaleY(values[maxIndex]);
              return (
                <>
                  <image
                    x={x - 15}
                    y={y - 32}
                    width={30}
                    height={30}
                    href="/images/ic_crown.png"
                  />
                </>
              );
            })()}
          </g>
        )}
        </svg>
        
        {/* Custom Tooltip */}
        <ToolTip
          isVisible={hoveredBar !== null}
          position={mousePosition}
          label={hoveredBar !== null ? labels[hoveredBar] : ""}
          value={hoveredBar !== null ? `${formatPreciseNumber(values[hoveredBar])} (${counts[hoveredBar].toLocaleString()}건)` : ""}
        />
      </div>
    </div>
  );
}

function formatNumber(v: number) {
  // show in 억원 when >= 100000000
  if (v >= 100000000) {
    const x = v / 100000000;
    return `${x.toFixed(x >= 10 ? 0 : 1)}억원`;
  } else if (v >= 10000) {
    const x = v / 10000;
    return `${x.toFixed(x >= 10 ? 0 : 1)}만원`;
  }
  return `${v.toLocaleString()}원`;
}

function formatPreciseNumber(v: number) {
  // Always show precise number with comma separator for hover tooltips
  return `${v.toLocaleString()}원`;
}

function formatCount(v: number) {
  // Format count values for right Y-axis
  if (v >= 10000) {
    const x = v / 10000;
    return `${x.toFixed(x >= 10 ? 0 : 1)}만건`;
  }
  return `${v.toLocaleString()}건`;
}
