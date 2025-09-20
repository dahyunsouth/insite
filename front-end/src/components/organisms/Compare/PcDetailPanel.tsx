"use client";

import React from "react";

export type PcMeta = {
  id: number; // 1..10
  code: string; // PC1 .. PC10
  name: string; // short name
  features: string[]; // variables list
  meaning: string; // one-line meaning
  highText: string; // score high interpretation
  lowText: string;  // score low interpretation
};

type PcDetailPanelProps = {
  pc: PcMeta;
  aName?: string;
  bName?: string;
  aScore?: number | null;
  bScore?: number | null;
  className?: string;
};

export default function PcDetailPanel({ pc, aName = "A", bName = "B", aScore = null, bScore = null, className }: PcDetailPanelProps) {
  const delta = aScore != null && bScore != null ? aScore - bScore : null;
  const deltaLabel = delta == null ? "-" : (delta > 0 ? `+${Math.round(delta)}` : Math.round(delta).toString());
  const deltaColor = delta == null ? "text-gray-500" : delta > 0 ? "text-[#2563EB]" : delta < 0 ? "text-[#F472B6]" : "text-gray-600";

  return (
    <section className={("rounded-2xl border border-gray-200 bg-white p-5 h-full flex flex-col justify-between " + (className ?? "")).trim()} aria-labelledby="pc-detail-title" id="pc-detail">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 id="pc-detail-title" className="text-lg font-semibold text-gray-900">{pc.code} · {pc.name}</h3>
          <p className="mt-1 text-sm text-gray-600">{pc.meaning}</p>
        </div>
      </header>

      {/* Features */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pc.features.map((f, i) => (
          <span key={i} className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600">{f}</span>
        ))}
      </div>

      {/* Interpretation */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="rounded-xl bg-[#F8FAFF] p-3">
          <div className="text-xs font-medium text-[#2563EB]">점수가 클 때</div>
          <div className="mt-1 text-sm text-gray-800">{pc.highText}</div>
        </div>
        <div className="rounded-xl bg-[#FFF7FA] p-3">
          <div className="text-xs font-medium text-[#F472B6]">점수가 작을 때</div>
          <div className="mt-1 text-sm text-gray-800">{pc.lowText}</div>
        </div>
      </div>

      {/* Current comparison */}
      <div className="mt-4 grid grid-cols-3 items-end gap-3">
        <div>
          <div className="text-xs text-gray-500">{aName}</div>
          <div className="text-2xl font-bold text-gray-900">{aScore != null ? Math.round(aScore) : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{bName}</div>
          <div className="text-2xl font-bold text-gray-900">{bScore != null ? Math.round(bScore) : '-'}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Δ A-B</div>
          <div className={("text-xl font-semibold " + deltaColor).trim()}>{deltaLabel}</div>
        </div>
      </div>
    </section>
  );
}

