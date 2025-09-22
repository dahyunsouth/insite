"use client";

import React, { useEffect, useMemo, useState } from "react";

type RadarSeries = {
  name: string;
  values: number[];
  color?: string;
  dashed?: boolean;
  fillOpacity?: number;
};

type RadarChartProps = {
  labels: string[];
  series: RadarSeries[];
  maxValue?: number; // default: max of provided values
  levels?: number; // grid rings
  className?: string;
  /** Animate polygons expanding from center */
  animate?: boolean;
  /** Animation duration (ms) */
  duration?: number;
  /** Animation start delay (ms) */
  delay?: number;
  /** Easing: linear | easeOutCubic */
  easing?: "linear" | "easeOutCubic";
  /** Optional: currently selected axis index */
  selectedAxis?: number | null;
  /** Optional: click on axis/label */
  onSelectAxis?: (index: number) => void;
};

/**
 * Lightweight SVG RadarChart without external deps.
 * - Responsive: fills parent width/height via 100% sized SVG.
 * - Renders grid, axes, labels, legend and series (solid/dashed).
 */
export default function RadarChart({
  labels,
  series,
  maxValue,
  levels = 5,
  className,
  animate = true,
  duration = 700,
  delay = 0,
  easing = "easeOutCubic",
  selectedAxis = null,
  onSelectAxis,
}: RadarChartProps) {
  const N = labels.length;
  if (N === 0) return null;

  const flatValues = series.flatMap((s) => s.values);
  const computedMax = Math.max(1, ...(flatValues.length ? flatValues : [1]));
  const max = Math.max(1, maxValue ?? computedMax);

  const easingFn = useMemo(() => {
    if (easing === "linear") return (t: number) => t;
    // default easeOutCubic
    return (t: number) => 1 - Math.pow(1 - t, 3);
  }, [easing]);

  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) {
      setProgress(1);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const total = Math.max(0, duration);
    const wait = Math.max(0, delay);
    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, Math.max(0, (elapsed - wait) / total));
      setProgress(easingFn(t));
      if (elapsed < wait + total) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate, duration, delay, easingFn]);

  // Layout constants within a 300x300 viewbox
  const size = 300; // math space
  const padding = 60; // for labels
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - padding;
  const startAngle = -Math.PI / 2; // top
  const angleStep = (Math.PI * 2) / N;

  const pointAt = (r: number, angle: number) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;

  const polygonPath = (vals: number[]) => {
    const pts = vals.map((v, i) => {
      const a = startAngle + i * angleStep;
      const r = radius * Math.max(0, Math.min(1, (v / max) * progress));
      const [x, y] = pointAt(r, a);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
    return pts.join(" ") + " Z";
  };

  const gridPolygons = Array.from({ length: levels }, (_, i) => {
    const t = (i + 1) / levels;
    const r = radius * t;
    const pts = Array.from({ length: N }, (_, j) => {
      const a = startAngle + j * angleStep;
      const [x, y] = pointAt(r, a);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
    return <polygon key={i} points={pts} fill="none" stroke="#E5E7EB" />; // gray-200
  });

  const axisLines = Array.from({ length: N }, (_, j) => {
    const a = startAngle + j * angleStep;
    const [x, y] = pointAt(radius, a);
    return <line key={j} x1={cx} y1={cy} x2={x} y2={y} stroke="#EEF2F7" />; // very light
  });

  // 격자선 값 표시 (첫 번째 축에만 표시)
  const gridValueNodes = Array.from({ length: levels }, (_, i) => {
    const t = (i + 1) / levels;
    const r = radius * t;
    const value = (max * t).toFixed(0); // 정수로 표시
    const a = startAngle; // 첫 번째 축 방향
    const [x, y] = pointAt(r, a);
    
    return (
      <text
        key={`grid-value-${i}`}
        x={x + 8} // 축선에서 약간 오른쪽으로
        y={y} // 약간 위로
        style={{ 
          fontSize: 10, 
          fill: "#9CA3AF", // gray-400
          fontWeight: 400 
        }}
        textAnchor="start"
      >
        {value}
      </text>
    );
  });

  const labelNodes = labels.map((lab, j) => {
    const a = startAngle + j * angleStep;
    const [x, y] = pointAt(radius + 16, a); // place slightly outside
    const cos = Math.cos(a);
    const textAnchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
    const dy = Math.sin(a) > 0.2 ? 12 : Math.sin(a) < -0.2 ? -6 : 4;
    const active = selectedAxis === j;
    return (
      <g key={lab} className="cursor-pointer" onClick={() => onSelectAxis?.(j)}>
        {/* invisible hit area for easier clicks */}
        <circle cx={x} cy={y + dy - 4} r={16} fill="transparent" />
        <text
          x={x}
          y={y + dy}
          textAnchor={textAnchor}
          style={{ fontSize: 14, fill: active ? "#2563EB" : "#6B7280", fontWeight: active ? 600 : 400 }}
        >
          {lab}
        </text>
      </g>
    );
  });

  const colorsFallback = ["#2563EB", "#60A5FA", "#22C55E", "#F59E0B"]; // blue, light-blue, green, amber

  return (
    <div className={"w-full h-full flex flex-col items-center justify-center " + (className ?? "")}> 
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {/* Grid */}
        <g>{gridPolygons}</g>
        {/* Axes */}
        <g>{axisLines}</g>
        {/* Grid Values */}
        <g>{gridValueNodes}</g>
        {/* Series */}
        {series.map((s, i) => (
          <g key={s.name}>
            <path
              d={polygonPath(s.values)}
              fill={s.color ?? colorsFallback[i % colorsFallback.length]}
              fillOpacity={s.fillOpacity ?? 0.08}
              stroke={s.color ?? colorsFallback[i % colorsFallback.length]}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "6 4" : undefined}
            />
            {/* Dots */}
            {s.values.map((v, j) => {
              const a = startAngle + j * angleStep;
              const r = radius * Math.max(0, Math.min(1, (v / max) * progress));
              const [x, y] = pointAt(r, a);
              return (
                <circle
                  key={`${s.name}-${j}`}
                  cx={x}
                  cy={y}
                  r={Math.max(0.5, 2.5 * progress)}
                  fill={s.color ?? colorsFallback[i % colorsFallback.length]}
                />
              );
            })}
          </g>
        ))}
        {/* Labels */}
        <g>{labelNodes}</g>
      </svg>
      
      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
        {series.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-6"
              style={{
                background: "transparent",
                borderTop: `2px ${s.dashed ? "dashed" : "solid"} ${s.color ?? colorsFallback[i % colorsFallback.length]}`,
              }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
