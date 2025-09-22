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
          <h3 id="pc-detail-title" className="text-lg font-semibold text-gray-900">{pc.code}</h3>
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
      <div className="mt-4">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">지표</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">0점</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">100점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pc.code === "지속성" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">운영 개월 평균</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">12개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">60개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">폐업 개월 평균</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">6개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">36개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">개업률</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1% 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10% 이상</td>
                  </tr>
                </>
              )}
              {pc.code === "수익성" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">시장 잠재력</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10개 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">50개 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">수요 공급 균형</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">50% 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10% 이하</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">소득 수준</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">200만원 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">400만원 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">집객시설</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10개 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">50개 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">예측 매출</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1천만원 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1억원 이상</td>
                  </tr>
                </>
              )}
              {pc.code === "접근성" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">지하철역 거리</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">3km 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">200m 이내</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">버스정류장 거리</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1km 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">100m 이내</td>
                  </tr>
                </>
              )}
              {pc.code === "위험도" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">유동인구/점포수</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">2만명/점포 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10만명/점포 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">폐업 개월</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">6개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">24개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">폐업률</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">20% 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">2% 이하</td>
                  </tr>
                </>
              )}
              {pc.code === "경쟁강도" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">점포 수</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">30개 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">5개 이하</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">운영 개월</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">3만명 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10만명 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">점포 밀도</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">3.0개/100㎡ 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">0.5개/100㎡ 이하</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
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

