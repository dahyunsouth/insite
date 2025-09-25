"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import RadarChart from "@/components/molecules/Detail/Chart/RadarChart";
import PcDetailPanel, { PcMeta } from "@/components/organisms/Compare/PcDetailPanel";
import TradeAreaPicker, { TradeAreaSelection } from "@/components/molecules/Compare/TradeAreaPicker";
import { fetchTradeAreaDetail, mapTradeAreaDetailToMetrics, TradeAreaDetail, fetchTradeAreaScore, TradeAreaScore, getTradeAreaNameByCode } from "@/lib/api/tradeAreas";
import TradeAreaRawData from "@/data/TradeAreaValue.json";
import MarketChangeIndicatorInfoModal from "@/components/molecules/Detail/MarketChangeIndicator/MarketChangeIndicatorInfoModal";

// TradeAreaRawData 타입 정의
interface TradeAreaFileShape {
  DESCRIPTION: Record<string, unknown>;
  DATA: Array<{
    trdar_cd: string;
    trdar_cd_nm: string;
    trdar_se_cd: string;
    trdar_se_cd_nm: string;
    signgu_cd: string;
    signgu_cd_nm: string;
    adstrd_cd: string;
    adstrd_cd_nm: string;
  }>;
}

// TradeAreaRawData에서 상권 코드로 자치구/행정동 정보를 매핑하는 Map 생성
const TRADE_AREA_BY_CODE = (() => {
  const json = TradeAreaRawData as unknown as TradeAreaFileShape;
  return new Map(json.DATA.map((item) => [
    item.trdar_cd,
    {
      signguCode: item.signgu_cd,
      signguName: item.signgu_cd_nm,
      adstrdCode: item.adstrd_cd,
      adstrdName: item.adstrd_cd_nm,
    }
  ]));
})();

type CompareTradeAreasModalProps = {
  open: boolean;
  onClose: () => void;
  /** Whether the left sidebar (25%) is open. Controls overlay area and layout. */
  leftOpen?: boolean;
  /** Modal type: 'compare' for full screen with dim, 'saved' for sidebar area */
  modalType?: 'compare' | 'saved';
  /** Pre-selected trade areas from saved areas */
  preSelectedTradeAreas?: { trdarCd: string; trdarCdNm: string }[];
  /** Pre-selected trade area 1 from comparison tray */
  selectedTradeArea1?: { trdarCd: string; trdarCdNm: string } | null;
  /** Pre-selected trade area 2 from comparison tray */
  selectedTradeArea2?: { trdarCd: string; trdarCdNm: string } | null;
  /** Whether the navbar is open */
  navbarOpen?: boolean;
};

export default function CompareTradeAreasModal({ open, onClose, leftOpen = true, modalType = 'compare', preSelectedTradeAreas, selectedTradeArea1, selectedTradeArea2, navbarOpen = true }: CompareTradeAreasModalProps) {
  const [selectedPc, setSelectedPc] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'analysis' | 'data'>('analysis');
  const [selectionA, setSelectionA] = useState<TradeAreaSelection>({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
  const [selectionB, setSelectionB] = useState<TradeAreaSelection>({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
  
  // 상세 데이터 API 상태 (상세 탭용)
  const [detailA, setDetailA] = useState<TradeAreaDetail | null>(null);
  const [detailB, setDetailB] = useState<TradeAreaDetail | null>(null);
  const [loadingA, setLoadingA] = useState<boolean>(false);
  const [loadingB, setLoadingB] = useState<boolean>(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  // 종합 분석 점수 API 상태 (종합 탭용)
  const [scoreA, setScoreA] = useState<TradeAreaScore | null>(null);
  const [scoreB, setScoreB] = useState<TradeAreaScore | null>(null);
  const [loadingScoreA, setLoadingScoreA] = useState<boolean>(false);
  const [loadingScoreB, setLoadingScoreB] = useState<boolean>(false);
  const [errorScoreA, setErrorScoreA] = useState<string | null>(null);
  const [errorScoreB, setErrorScoreB] = useState<string | null>(null);
  
  // 상권 변화 지표 툴팁 상태
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLButtonElement>(null);
  
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Auto-select pre-selected trade areas when modal opens
  useEffect(() => {
    if (!open || !preSelectedTradeAreas || preSelectedTradeAreas.length === 0) return;
    
    // Reset selections first
    setSelectionA({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
    setSelectionB({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
    
    // Set first trade area to selection A
    if (preSelectedTradeAreas.length >= 1) {
      const tradeAreaInfo1 = TRADE_AREA_BY_CODE.get(preSelectedTradeAreas[0].trdarCd);
      setSelectionA({ 
        signguCode: tradeAreaInfo1?.signguCode || null, 
        adstrdCode: tradeAreaInfo1?.adstrdCode || null, 
        tradeAreaCode: preSelectedTradeAreas[0].trdarCd 
      });
    }
    
    // Set second trade area to selection B if available
    if (preSelectedTradeAreas.length >= 2) {
      const tradeAreaInfo2 = TRADE_AREA_BY_CODE.get(preSelectedTradeAreas[1].trdarCd);
      setSelectionB({ 
        signguCode: tradeAreaInfo2?.signguCode || null, 
        adstrdCode: tradeAreaInfo2?.adstrdCode || null, 
        tradeAreaCode: preSelectedTradeAreas[1].trdarCd 
      });
    }
  }, [open, preSelectedTradeAreas]);

  // Auto-select trade areas from comparison tray
  useEffect(() => {
    if (!open || !selectedTradeArea1 || !selectedTradeArea2) return;
    
    // Reset selections first
    setSelectionA({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
    setSelectionB({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
    
    // Set trade area 1 to selection A
    const tradeAreaInfo1 = TRADE_AREA_BY_CODE.get(selectedTradeArea1.trdarCd);
    setSelectionA({ 
      signguCode: tradeAreaInfo1?.signguCode || null, 
      adstrdCode: tradeAreaInfo1?.adstrdCode || null, 
      tradeAreaCode: selectedTradeArea1.trdarCd 
    });
    
    // Set trade area 2 to selection B
    const tradeAreaInfo2 = TRADE_AREA_BY_CODE.get(selectedTradeArea2.trdarCd);
    setSelectionB({ 
      signguCode: tradeAreaInfo2?.signguCode || null, 
      adstrdCode: tradeAreaInfo2?.adstrdCode || null, 
      tradeAreaCode: selectedTradeArea2.trdarCd 
    });
  }, [open, selectedTradeArea1, selectedTradeArea2]);

  // Body scroll lock while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  // 상권 A 데이터 로드
  useEffect(() => {
    if (!selectionA.tradeAreaCode) {
      setDetailA(null);
      setErrorA(null);
      return;
    }
    const loadDetailA = async () => {
      setLoadingA(true);
      setErrorA(null);
      try {
        const data = await fetchTradeAreaDetail(selectionA.tradeAreaCode!);
        setDetailA(data);
      } catch (err) {
        setErrorA(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다.");
        setDetailA(null);
      } finally {
        setLoadingA(false);
      }
    };
    loadDetailA();
  }, [selectionA.tradeAreaCode]);

  // 상권 B 데이터 로드
  useEffect(() => {
    if (!selectionB.tradeAreaCode) {
      setDetailB(null);
      setErrorB(null);
      return;
    }
    const loadDetailB = async () => {
      setLoadingB(true);
      setErrorB(null);
      try {
        const data = await fetchTradeAreaDetail(selectionB.tradeAreaCode!);
        setDetailB(data);
      } catch (err) {
        setErrorB(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다.");
        setDetailB(null);
      } finally {
        setLoadingB(false);
      }
    };
    loadDetailB();
  }, [selectionB.tradeAreaCode]);

  // 종합 분석 점수 A 데이터 로드
  useEffect(() => {
    if (!selectionA.tradeAreaCode) {
      setScoreA(null);
      setErrorScoreA(null);
      return;
    }
    const loadScoreA = async () => {
      setLoadingScoreA(true);
      setErrorScoreA(null);
      try {
        const tradeAreaName = getTradeAreaNameByCode(selectionA.tradeAreaCode!);
        if (tradeAreaName === "상권명 없음") {
          throw new Error("상권명을 찾을 수 없습니다.");
        }
        const data = await fetchTradeAreaScore(tradeAreaName);
        console.log('상권 A 종합 분석 점수:', data);
        setScoreA(data);
      } catch (err) {
        setErrorScoreA(err instanceof Error ? err.message : "점수 데이터를 불러올 수 없습니다.");
        setScoreA(null);
      } finally {
        setLoadingScoreA(false);
      }
    };
    loadScoreA();
  }, [selectionA.tradeAreaCode]);

  // 종합 분석 점수 B 데이터 로드
  useEffect(() => {
    if (!selectionB.tradeAreaCode) {
      setScoreB(null);
      setErrorScoreB(null);
      return;
    }
    const loadScoreB = async () => {
      setLoadingScoreB(true);
      setErrorScoreB(null);
      try {
        const tradeAreaName = getTradeAreaNameByCode(selectionB.tradeAreaCode!);
        if (tradeAreaName === "상권명 없음") {
          throw new Error("상권명을 찾을 수 없습니다.");
        }
        const data = await fetchTradeAreaScore(tradeAreaName);
        console.log('상권 B 종합 분석 점수:', data);
        setScoreB(data);
      } catch (err) {
        setErrorScoreB(err instanceof Error ? err.message : "점수 데이터를 불러올 수 없습니다.");
        setScoreB(null);
      } finally {
        setLoadingScoreB(false);
      }
    };
    loadScoreB();
  }, [selectionB.tradeAreaCode]);

  if (!open) return null;

  // showThird 로직: compare는 항상 3열, saved는 leftOpen 상태에 따라
  const showThird = modalType === 'compare' ? true : !leftOpen;


  // API 데이터를 기반으로 metrics 생성 (매출, 점포, 인구, 상권 변화 지표 순)
  const metricsA = mapTradeAreaDetailToMetrics(detailA);
  const metricsB = mapTradeAreaDetailToMetrics(detailB);

  // 지표별 단위 매핑
  const getUnit = (key: string) => {
    switch (key) {
      case '매출':
        return '원';
      case '점포':
        return '개';
      case '유동인구':
        return '명';
      case '상주인구':
        return '명';
      case '직장인구':
        return '명';
      case '상권변화지표':
        return '';
      default:
        return '';
    }
  };

  // 상권명 추출 (종합 분석 데이터 또는 상세 데이터에서 가져오기)
  const tradeAreaNameA = scoreA?.areaName || detailA?.trdarCdNm || 
    (selectionA.tradeAreaCode ? getTradeAreaNameByCode(selectionA.tradeAreaCode) : "미선택");
  const tradeAreaNameB = scoreB?.areaName || detailB?.trdarCdNm || 
    (selectionB.tradeAreaCode ? getTradeAreaNameByCode(selectionB.tradeAreaCode) : "미선택");

  // 툴팁 열기/닫기 함수
  const handleTooltipToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTooltipOpen) {
      setIsTooltipOpen(false);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const modalHeight = 640; // 모달의 대략적인 높이
      const viewportHeight = window.innerHeight;
      const bottomMargin = 50; // 뷰포트 하단에서 떨어질 거리
      
      // 모달이 화면 하단에서 잘리지 않도록 위치 조정
      let topPosition = rect.top + window.scrollY - 10;
      const maxTop = viewportHeight - modalHeight - bottomMargin;
      
      if (topPosition > maxTop) {
        topPosition = maxTop;
      }
      
      setTooltipPosition({
        top: topPosition,
        left: rect.right + window.scrollX + 8 // 버튼 오른쪽에 8px 간격으로 배치
      });
      setIsTooltipOpen(true);
    }
  };

  const metrics = [
    { key: metricsA.sales.key, a: loadingA ? "로딩중..." : metricsA.sales.value, b: loadingB ? "로딩중..." : metricsB.sales.value, aNum: metricsA.sales.numValue, bNum: metricsB.sales.numValue },
    { key: metricsA.stores.key, a: loadingA ? "로딩중..." : metricsA.stores.value, b: loadingB ? "로딩중..." : metricsB.stores.value, aNum: metricsA.stores.numValue, bNum: metricsB.stores.numValue },
    { key: metricsA.floating.key, a: loadingA ? "로딩중..." : metricsA.floating.value, b: loadingB ? "로딩중..." : metricsB.floating.value, aNum: metricsA.floating.numValue, bNum: metricsB.floating.numValue },
    { key: metricsA.residents.key, a: loadingA ? "로딩중..." : metricsA.residents.value, b: loadingB ? "로딩중..." : metricsB.residents.value, aNum: metricsA.residents.numValue, bNum: metricsB.residents.numValue },
    { key: metricsA.workers.key, a: loadingA ? "로딩중..." : metricsA.workers.value, b: loadingB ? "로딩중..." : metricsB.workers.value, aNum: metricsA.workers.numValue, bNum: metricsB.workers.numValue },
    { key: metricsA.changeIndex.key, a: loadingA ? "로딩중..." : metricsA.changeIndex.value, b: loadingB ? "로딩중..." : metricsB.changeIndex.value, aNum: metricsA.changeIndex.numValue, bNum: metricsB.changeIndex.numValue },
  ] as const;

  return createPortal(
    <div
      className={`fixed z-[320] ${modalType === 'compare' ? 'inset-0' : ''}`}
      style={modalType === 'saved' ? { 
        left: '25%', 
        right: 0, 
        top: 0, 
        bottom: 0 
      } : modalType === 'compare' ? {
        left: navbarOpen ? '25%' : '0%',
        right: 0,
        top: 0,
        bottom: 0
      } : {}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      {/* Modal positioned in center area */}
      <div className={`relative z-10 flex items-center justify-center ${modalType === 'compare' ? 'h-screen' : 'h-full'}`}>
        <div
          className="w-full h-full bg-white shadow-xl border border-black/5 overflow-visible flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-8 pt-8 pb-4 border-b border-black/5 text-center">
            <h2 id="compare-modal-title" className="text-3xl font-extrabold text-gray-900">
              {/* 상권 비교하기 */}
              상권 비교
            </h2>
            <p className="mt-1 text-sm text-gray-500">모든 상권 중 두 곳을 선택해 한눈에 비교해보실 수 있습니다☺️</p>

            {/* 상권 비교 모달 닫기 버튼 */}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-gray-50 shadow-sm border border-gray-200 cursor-pointer"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-8 py-8 overflow-x-visible">
            {/* Lower Section: At a Glance */}
            {/* Selectors aligned to columns */}
            <div className="mt-0">
              {/* <div className="text-2xl font-extrabold text-gray-900">한눈에 보기</div> */}
              <div className={`mt-0 grid gap-x-10 ${showThird ? "grid-cols-[1fr_1fr_240px]" : "grid-cols-2"}`}>
                <TradeAreaPicker
                  title="📍상권 1"
                  value={selectionA}
                  onChange={setSelectionA}
                  accentColor="#2563eb"
                  backgroundColor="rgba(190, 210, 253, 0.1)"
                />
                <TradeAreaPicker title="📍상권 2"
                value={selectionB}
                onChange={setSelectionB}
                accentColor="#f472b6"
                backgroundColor="rgba(252, 220, 237, 0.1)"
                />
                {showThird && <div />}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-8 border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`pb-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'analysis'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  종합
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`pb-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'data'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  상세
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'analysis' && (
              <>
                {/* Upper Section: Chart + Detail */}
                <div className={`mt-6 grid gap-x-10 ${showThird ? "grid-cols-[1fr_1fr_240px]" : "grid-cols-2"}`}>
                {/* Upper Left: Radar Chart */}
                <div>
                  {(() => {
                  const labels = [
                    "지속성","수익성","접근성","위험도","경쟁강도",
                  ];
                  
                  // API 데이터에서 점수 추출 (원본 값 그대로 사용)
                  const aValues = scoreA ? [
                    scoreA.sustainabilityScore,
                    scoreA.profitabilityScore,
                    scoreA.accessibilityScore,
                    scoreA.riskScore,
                    scoreA.competitionScore
                  ] : [0, 0, 0, 0, 0];
                  
                  const bValues = scoreB ? [
                    scoreB.sustainabilityScore,
                    scoreB.profitabilityScore,
                    scoreB.accessibilityScore,
                    scoreB.riskScore,
                    scoreB.competitionScore
                  ] : [0, 0, 0, 0, 0];
                  
                  // 실제로 선택된 상권만 시리즈에 포함
                  const series = [];
                  if (scoreA && selectionA.tradeAreaCode) {
                    series.push({ name: tradeAreaNameA, values: aValues, color: "#2563EB", dashed: false, fillOpacity: 0.08 });
                  }
                  if (scoreB && selectionB.tradeAreaCode) {
                    series.push({ name: tradeAreaNameB, values: bValues, color: "#F472B6", dashed: true, fillOpacity: 0.08 });
                  }
                  
                  return (
                    <div className="mx-auto w-full aspect-square rounded-2xl border border-gray-200 bg-white p-6">
                      <RadarChart
                        labels={labels}
                        series={series}
                        maxValue={100}
                        levels={5}
                        selectedAxis={selectedPc}
                        onSelectAxis={(idx) => setSelectedPc(idx)}
                      />
                    </div>
                  );
                })()}
                </div>

                {/* Upper Right: Detail panel */}
                <div className={showThird ? "col-span-2" : ""}>
                  {(() => {
                  const pcs: PcMeta[] = [
                    { id:1, code:"지속성", name:"상권 생존 가능성", features:["운영_개월_평균","폐업_개월_평균","개업률"], meaning:"상권의 생존력을 나타내는 지표입니다.", highText:"운영 60개월 이상, 폐업 36개월 이상, 개업률 10% 이상의 매우 안정적인 상권", lowText:"운영 12개월 미만, 폐업 6개월 미만, 개업률 1% 미만의 극도로 불안정한 상권" },
                    { id:2, code:"수익성", name:"시장 잠재력", features:["시장_잠재력","수요-공급_균형","소득_수준","집객시설","예측_매출"], meaning:"상권의 수익성과 시장 잠재력", highText:"유사업종 50개 이상, 포화도 10% 이하, 유동인구 10만명/점포 이상, 소득 400만원 이상, 집객시설 50개 이상, 예측매출 1억원 이상의 높은 수익성 상권", lowText:"유사업종 10개 미만, 포화도 50% 초과, 유동인구 2만명/점포 미만, 소득 200만원 미만, 집객시설 10개 미만, 예측매출 1천만원 미만의 낮은 수익성 상권" },
                    { id:3, code:"접근성", name:"교통편의성", features:["지하철역_거리","버스_정류장_거리"], meaning:"상권의 교통 편의성을 나타냅니다.", highText:"지하철역 200m 이내, 버스정류장 100m 이내의 교통편의성이 매우 좋은 상권", lowText:"지하철역 3km 초과, 버스정류장 1km 초과의 교통편의성이 떨어지는 상권" },
                    { id:4, code:"위험도", name:"사업 위험 요소 (벌점 방식)", features:["점포_수_대비_유동인구","폐업_개월","폐업률"], meaning:"상권의 위험도를 나타냅니다.", highText:"유동인구 10만명/점포 이상, 폐업 24개월 이상, 폐업률 2% 이하의 위험이 낮은 안정적 상권", lowText:"유동인구 2만명/점포 미만, 폐업 6개월 미만, 폐업률 20% 초과의 위험이 높은 불안정 상권" },
                    { id:5, code:"경쟁강도", name:"경쟁 상황", features:["점포_수","수요_밀도","점포_밀도"], meaning:"상권의 경쟁 강도를 나타냅니다.", highText:"점포 5개 이하, 유동인구 10만명 이상, 점포밀도 0.5개/100㎡ 이하의 경쟁이 약한 상권", lowText:"점포 30개 초과, 유동인구 3만명 미만, 점포밀도 3.0개/100㎡ 초과의 경쟁이 치열한 상권" },
                  ];
                  const labels = pcs.map((p) => p.code);
                  
                  // API 데이터에서 점수 추출 (원본 값 그대로 사용: 지속성, 수익성, 접근성, 위험도, 경쟁강도)
                  const aValues = scoreA ? [
                    scoreA.sustainabilityScore,
                    scoreA.profitabilityScore,
                    scoreA.accessibilityScore,
                    scoreA.riskScore,
                    scoreA.competitionScore
                  ] : [0, 0, 0, 0, 0];
                  
                  const bValues = scoreB ? [
                    scoreB.sustainabilityScore,
                    scoreB.profitabilityScore,
                    scoreB.accessibilityScore,
                    scoreB.riskScore,
                    scoreB.competitionScore
                  ] : [0, 0, 0, 0, 0];
                  
                  const idx = Math.max(0, Math.min(4, selectedPc ?? 0));
                  return (
                    <PcDetailPanel
                      pc={pcs[idx]}
                      aName={tradeAreaNameA}
                      bName={tradeAreaNameB}
                      aScore={scoreA ? aValues[idx] : null}
                      bScore={scoreB ? bValues[idx] : null}
                    />
                  );
                })()}
                </div>
                </div>
              </>
            )}

            {activeTab === 'data' && (
              <>
                {/* Metrics rows */}
            <div className={`mt-2 grid gap-x-10 ${showThird ? "grid-cols-[1fr_1fr_240px]" : "grid-cols-2"}`}>
              {metrics.map((m, idx) => (
                <React.Fragment key={`${m.key}-${idx}`}>
                  <div className={`py-6 ${idx === 0 ? '' : 'border-t border-gray-200'}`}>
                    <div className="text-gray-500 flex items-center gap-2">
                      {m.key}
                      {m.key === "상권변화지표" && (
                        <button
                          ref={tooltipRef}
                          onClick={handleTooltipToggle}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          aria-label="상권 변화 지표 설명 보기"
                        >
                          <span className="text-xs text-gray-600">?</span>
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">{m.a}</div>
                  </div>
                  <div className={`py-6 ${idx === 0 ? '' : 'border-t border-gray-200'}`}>
                    <div className="text-gray-500 flex items-center gap-2">
                      {m.key}
                      {m.key === "상권변화지표" && (
                        <button
                          onClick={handleTooltipToggle}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          aria-label="상권 변화 지표 설명 보기"
                        >
                          <span className="text-xs text-gray-600">?</span>
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">{m.b}</div>
                  </div>
                  {showThird && m.key !== "상권변화지표" && (
                    <div className={`py-6 ${idx === 0 ? '' : 'border-t border-gray-200'} flex items-center`}>
                      <div className="w-full">
                        <div className="text-gray-500 mb-2">
                          {m.key}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-4 rounded bg-[#2563eb]" style={{ width: `${Math.max(m.aNum, m.bNum) > 0 ? (m.aNum / Math.max(m.aNum, m.bNum)) * 100 : 0}%` }} />
                          <span className="text-sm text-gray-700 text-right whitespace-nowrap">{m.aNum === 0 ? "-" : `${m.aNum.toLocaleString()}${getUnit(m.key)}`}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-24 h-4 rounded bg-[#f472b6]" style={{ width: `${Math.max(m.aNum, m.bNum) > 0 ? (m.bNum / Math.max(m.aNum, m.bNum)) * 100 : 0}%` }} />
                          <span className="text-sm text-gray-700 text-right whitespace-nowrap">{m.bNum === 0 ? "-" : `${m.bNum.toLocaleString()}${getUnit(m.key)}`}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 상권 변화 지표 툴팁 모달 */}
      <MarketChangeIndicatorInfoModal
        isOpen={isTooltipOpen}
        onClose={() => setIsTooltipOpen(false)}
        position={tooltipPosition}
      />
    </div>,
    document.body
  );
}
