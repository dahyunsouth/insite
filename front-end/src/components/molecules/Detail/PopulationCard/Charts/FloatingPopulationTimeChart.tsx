"use client";

import React, { useState } from "react";
import ToolTip from "./ToolTip";

type Props = {
  labels: string[]; // 6 labels
  values: number[]; // 6 values
  maxIndex?: number | null;
  className?: string;
};

export default function TimeSlotBarChart({ labels, values, maxIndex = null, className }: Props) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const W = 560;
  const H = 260;
  const m = { top: 32, right: 12, bottom: 20, left: 60 };
  const cw = W - m.left - m.right;
  const ch = H - m.top - m.bottom;

  const n = values.length;
  const maxVal = Math.max(1, ...values);
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


  // Custom tick values: 0, min, min + diff/3, min + 2*diff/3, max
  const tickVals = [
    0,
    minValue,
    minValue + (maxValue - minValue) / 3,
    minValue + (2 * (maxValue - minValue)) / 3,
    maxValue
  ];

  return (
    <div className={(className ? `flex justify-center ${className}` : "flex justify-center")}>
      <div className="relative">
        <svg width={W} height={H} role="img" aria-label="시간대별 유동인구 막대 차트">
        {/* grid & axes */}
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
          
          const barY = m.top + ch - ratio * ch;
          const barHeight = ratio * ch;
          
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
          value={hoveredBar !== null ? formatPreciseNumber(values[hoveredBar]) : ""}
        />
      </div>
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

function formatPreciseNumber(v: number) {
  // Always show precise number with comma separator for hover tooltips
  return `${v.toLocaleString()}명`;
}

