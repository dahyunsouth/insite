"use client";

import React, { useState } from "react";

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
  const [showGaeeopryulTooltip, setShowGaeeopryulTooltip] = useState(false);
  const [showMarketPotentialTooltip, setShowMarketPotentialTooltip] = useState(false);
  const [showSupplyDemandTooltip, setShowSupplyDemandTooltip] = useState(false);
  const [showIncomeLevelTooltip, setShowIncomeLevelTooltip] = useState(false);
  const [showAttractionFacilityTooltip, setShowAttractionFacilityTooltip] = useState(false);
  const [showSubwayDistanceTooltip, setShowSubwayDistanceTooltip] = useState(false);
  const [showBusStopDistanceTooltip, setShowBusStopDistanceTooltip] = useState(false);
  const [showPopulationStoreTooltip, setShowPopulationStoreTooltip] = useState(false);
  const [showClosureMonthTooltip, setShowClosureMonthTooltip] = useState(false);
  const [showClosureRateTooltip, setShowClosureRateTooltip] = useState(false);
  const [showStoreCountTooltip, setShowStoreCountTooltip] = useState(false);
  const [showDemandDensityTooltip, setShowDemandDensityTooltip] = useState(false);
  const [showStoreDensityTooltip, setShowStoreDensityTooltip] = useState(false);
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
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>평균 운영 개월</span>
                        <button className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                          <span className="text-white text-xs font-medium">i</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">12개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">60개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>폐업 개월 평균</span>
                        <button className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                          <span className="text-white text-xs font-medium">i</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">6개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">36개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>개업률</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowGaeeopryulTooltip(true)}
                            onMouseLeave={() => setShowGaeeopryulTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showGaeeopryulTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              최근 분기의 전체 점포 수 대비 개업한 점포 수
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1% 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10% 이상</td>
                  </tr>
                </>
              )}
              {pc.code === "수익성" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>시장 잠재력</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowMarketPotentialTooltip(true)}
                            onMouseLeave={() => setShowMarketPotentialTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showMarketPotentialTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              카페와 유사한 업종의 점포 수를 통해 책정한 식음료 시장 규모와 점포 수 대비 유사 업종 점포 수 비율로 책정한 커피 전문점 포화도로 시장 잠재력을 책정하였습니다.
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10개 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">50개 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>수요 공급 균형</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowSupplyDemandTooltip(true)}
                            onMouseLeave={() => setShowSupplyDemandTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showSupplyDemandTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              유동인구 대비 점포 수
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">50% 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10% 이하</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>소득 수준</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowIncomeLevelTooltip(true)}
                            onMouseLeave={() => setShowIncomeLevelTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showIncomeLevelTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              월평균 소득금액
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">200만원 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">400만원 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>집객시설</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowAttractionFacilityTooltip(true)}
                            onMouseLeave={() => setShowAttractionFacilityTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showAttractionFacilityTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              고객 유입
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10개 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">50개 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>예측 매출</span>
                        <button className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                          <span className="text-white text-xs font-medium">i</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1천만원 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1억원 이상</td>
                  </tr>
                </>
              )}
              {pc.code === "접근성" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>지하철역 거리</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowSubwayDistanceTooltip(true)}
                            onMouseLeave={() => setShowSubwayDistanceTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showSubwayDistanceTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              상위 3개 역의 가중평균
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">3km 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">200m 이내</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>버스정류장 거리</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowBusStopDistanceTooltip(true)}
                            onMouseLeave={() => setShowBusStopDistanceTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showBusStopDistanceTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              상위 3개 정류장의 가중평균
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">1km 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">100m 이내</td>
                  </tr>
                </>
              )}
              {pc.code === "위험도" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>유동인구/점포수</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowPopulationStoreTooltip(true)}
                            onMouseLeave={() => setShowPopulationStoreTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showPopulationStoreTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              수요 부족 위험
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">2만명/점포 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10만명/점포 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>폐업 개월</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowClosureMonthTooltip(true)}
                            onMouseLeave={() => setShowClosureMonthTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showClosureMonthTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              생존력 부족 위험
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">6개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">24개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>폐업률</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowClosureRateTooltip(true)}
                            onMouseLeave={() => setShowClosureRateTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showClosureRateTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              시장 불안정 위험
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">20% 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">2% 이하</td>
                  </tr>
                </>
              )}
              {pc.code === "경쟁강도" && (
                <>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>점포 수</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowStoreCountTooltip(true)}
                            onMouseLeave={() => setShowStoreCountTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showStoreCountTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              단순 점포 개수 기준
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">30개 초과</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">5개 이하</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>운영 개월</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowDemandDensityTooltip(true)}
                            onMouseLeave={() => setShowDemandDensityTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showDemandDensityTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              유동인구 대비 점포 밀도
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">3만명 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10만명 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>점포 밀도</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowStoreDensityTooltip(true)}
                            onMouseLeave={() => setShowStoreDensityTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showStoreDensityTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 break-words min-w-max max-w-xs">
                              100m²당 점포 밀도 기준
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
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

