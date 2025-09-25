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

type ScoreInfoSectionProps = {
  pc: PcMeta;
  score?: number;
  className?: string;
};

export default function ScoreInfoSection({ pc, score, className }: ScoreInfoSectionProps) {
  const [showGaeeopryulTooltip, setShowGaeeopryulTooltip] = useState(false);
  const [showMarketPotentialTooltip, setShowMarketPotentialTooltip] = useState(false);
  const [showSupplyDemandTooltip, setShowSupplyDemandTooltip] = useState(false);
  const [showAttractionFacilityTooltip, setShowAttractionFacilityTooltip] = useState(false);
  const [showSubwayDistanceTooltip, setShowSubwayDistanceTooltip] = useState(false);
  const [showBusStopDistanceTooltip, setShowBusStopDistanceTooltip] = useState(false);
  const [showPopulationStoreTooltip, setShowPopulationStoreTooltip] = useState(false);
  const [showClosureMonthTooltip, setShowClosureMonthTooltip] = useState(false);
  const [showClosureRateTooltip, setShowClosureRateTooltip] = useState(false);
  const [showStoreCountTooltip, setShowStoreCountTooltip] = useState(false);
  const [showDemandDensityTooltip, setShowDemandDensityTooltip] = useState(false);
  const [showStoreDensityTooltip, setShowStoreDensityTooltip] = useState(false);

  return (
    <section className={("rounded-2xl border border-gray-200 bg-white p-5 flex flex-col overflow-visible relative h-fit " + (className ?? "")).trim()} aria-labelledby="score-info-title" id="score-info">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 id="score-info-title" className="text-lg font-semibold text-gray-900">{pc.code}</h3>
            {score !== undefined && (
              <span className="text-lg font-bold text-blue-600">{score}점</span>
            )}
          </div>
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
        <div className="rounded-xl border border-gray-200">
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
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">12개월 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">60개월 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>평균 폐업 개월</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowClosureMonthTooltip(true)}
                            onMouseLeave={() => setShowClosureMonthTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showClosureMonthTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              · 폐업 전 평균 운영 개월 수<br/>
                              · 해당 상권의 생존력 부족 위험도를 나타냅니다.
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              최신 분기 기준, 해당 상권 내 전체 점포 수 대비 개업한 점포 수
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권 내<br/>
                              카페와 유사한 업종의 점포 수를 통해 도출한 &apos;식음료 시장 규모&apos;와<br/>
                              유사 업종 점포 수 대비 커피-음료 업종 점포 수 비율로 도출한 &apos;커피 전문점 포화도&apos;로<br/>
                              시장 잠재력을 산정하였습니다.
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
                        <span>수요-공급 균형</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowSupplyDemandTooltip(true)}
                            onMouseLeave={() => setShowSupplyDemandTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showSupplyDemandTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권의 유동인구 대비 점포 수
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              집객시설은 사람이나 유동인구를 끌어모으는 역할을 하는 시설을 의미합니다.<br/>
                              주로 영화관, 대형마트, 병원, 학교, 관공서, 백화점 등<br/>
                              다양한 상업·공공시설이 이에 해당합니다.
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
                        <span>예상 매출액</span>
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권과 인접한 상위 3개 역까지의 거리(가중평균)
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
                        <span>버스 정류장 거리</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowBusStopDistanceTooltip(true)}
                            onMouseLeave={() => setShowBusStopDistanceTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showBusStopDistanceTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권과 인접한 상위 3개 정류장까지의 거리(가중평균)
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
                        <span>점포 수 대비 유동인구</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowPopulationStoreTooltip(true)}
                            onMouseLeave={() => setShowPopulationStoreTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showPopulationStoreTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권의 수요부족 위험을 나타냅니다.
                              <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">2만명 미만</td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600">10만명 이상</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2 relative">
                        <span>평균 폐업 개월</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowClosureMonthTooltip(true)}
                            onMouseLeave={() => setShowClosureMonthTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showClosureMonthTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              · 폐업 전 평균 운영 개월 수<br/>
                              · 해당 상권의 생존력 부족 위험도를 나타냅니다.
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              · 해당 상권 내 전체 점포 수 대비 폐업 점포 수<br/>
                              · 해당 상권의 시장 불안정 위험을 나타냅니다.
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권 내 &apos;커피-음료&apos; 업종을 영위하는 점포의 수
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
                        <span>수요 밀도</span>
                        <div className="relative">
                          <button 
                            className="cursor-pointer w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                            onMouseEnter={() => setShowDemandDensityTooltip(true)}
                            onMouseLeave={() => setShowDemandDensityTooltip(false)}
                          >
                            <span className="text-white text-xs font-medium">i</span>
                          </button>
                          {showDemandDensityTooltip && (
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권 내 유동인구 대비 &apos;커피-음료&apos; 업종을 영위하는 점포의 수
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
                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[600] break-words min-w-max max-w-xs">
                              해당 상권 내 100m²당 &apos;커피-음료&apos; 업종을 영위하는 점포의 수
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
    </section>
  );
}
