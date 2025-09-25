'use client';

import React, { useState, useEffect } from 'react';
import TradeAreaPicker from '@/components/molecules/Compare/TradeAreaPicker';
import { fetchTradeAreasDetail, fetchTradeAreaDetail, mapTradeAreaDetailToMetrics } from '@/lib/api/tradeAreas';

interface NewCompareModalProps {
  open: boolean;
  onClose: () => void;
  navbarOpen?: boolean;
}

// 상권 선택 타입 정의
interface TradeAreaSelection {
  signguCode?: string | null;
  adstrdCode?: string | null;
  tradeAreaCode?: string | null;
}

// 상권 데이터 타입 정의
interface TradeAreaData {
  trdarCd: string;
  trdarCdNm: string;
  trdarSeCdNm: string;
}

// 비교 데이터 타입 정의
interface ComparisonData {
  [key: string]: {
    상권1: { value: string; numValue: number };
    상권2: { value: string; numValue: number };
  };
}

export default function NewCompareModal({ open, onClose, navbarOpen = true }: NewCompareModalProps) {
  // 상권 선택 상태
  const [selectionA, setSelectionA] = useState<TradeAreaSelection>({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
  const [selectionB, setSelectionB] = useState<TradeAreaSelection>({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
  
  // 상권 데이터 상태
  const [tradeAreaDataA, setTradeAreaDataA] = useState<TradeAreaData | null>(null);
  const [tradeAreaDataB, setTradeAreaDataB] = useState<TradeAreaData | null>(null);
  
  // 상권 상세 데이터 상태
  const [tradeAreaDetailA, setTradeAreaDetailA] = useState<any>(null);
  const [tradeAreaDetailB, setTradeAreaDetailB] = useState<any>(null);
  
  // 비교 데이터 상태
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // 상권 데이터 로드 함수
  const loadTradeAreaData = async (selection: TradeAreaSelection, isA: boolean) => {
    if (!selection.signguCode || !selection.adstrdCode || !selection.tradeAreaCode) return;
    
    try {
      setLoading(true);
      const data = await fetchTradeAreasDetail(selection.signguCode, selection.adstrdCode);
      const selectedTradeArea = data.areas.find(area => area.trdarCd.toString() === selection.tradeAreaCode);
      
      if (selectedTradeArea) {
        const tradeAreaData = {
          trdarCd: selectedTradeArea.trdarCd.toString(),
          trdarCdNm: selectedTradeArea.trdarCdNm,
          trdarSeCdNm: selectedTradeArea.trdarSeCdNm
        };
        
        if (isA) {
          setTradeAreaDataA(tradeAreaData);
        } else {
          setTradeAreaDataB(tradeAreaData);
        }
      }
    } catch (error) {
      console.error('상권 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상권 상세 데이터 로드 함수
  const loadTradeAreaDetailData = async (tradeAreaCode: string, isA: boolean) => {
    try {
      setLoading(true);
      const detailData = await fetchTradeAreaDetail(tradeAreaCode);
      const metrics = mapTradeAreaDetailToMetrics(detailData);
      
      if (isA) {
        setTradeAreaDetailA(metrics);
      } else {
        setTradeAreaDetailB(metrics);
      }
    } catch (error) {
      console.error('상권 상세 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상권 선택 변경 시 데이터 로드
  useEffect(() => {
    if (selectionA.tradeAreaCode) {
      loadTradeAreaData(selectionA, true);
      loadTradeAreaDetailData(selectionA.tradeAreaCode, true);
    } else {
      setTradeAreaDataA(null);
      setTradeAreaDetailA(null);
    }
  }, [selectionA]);

  useEffect(() => {
    if (selectionB.tradeAreaCode) {
      loadTradeAreaData(selectionB, false);
      loadTradeAreaDetailData(selectionB.tradeAreaCode, false);
    } else {
      setTradeAreaDataB(null);
      setTradeAreaDetailB(null);
    }
  }, [selectionB]);

  // 비교 데이터 생성 (실제 API 데이터)
  useEffect(() => {
    if (tradeAreaDetailA && tradeAreaDetailB) {
      setComparisonData({
        "월 매출액": { 
          상권1: { value: tradeAreaDetailA.sales.value, numValue: tradeAreaDetailA.sales.numValue }, 
          상권2: { value: tradeAreaDetailB.sales.value, numValue: tradeAreaDetailB.sales.numValue }
        },
        "점포 수": { 
          상권1: { value: tradeAreaDetailA.stores.value, numValue: tradeAreaDetailA.stores.numValue }, 
          상권2: { value: tradeAreaDetailB.stores.value, numValue: tradeAreaDetailB.stores.numValue }
        },
        "총 유동인구": { 
          상권1: { value: tradeAreaDetailA.floating.value, numValue: tradeAreaDetailA.floating.numValue }, 
          상권2: { value: tradeAreaDetailB.floating.value, numValue: tradeAreaDetailB.floating.numValue }
        },
        "총 상주인구": { 
          상권1: { value: tradeAreaDetailA.residents.value, numValue: tradeAreaDetailA.residents.numValue }, 
          상권2: { value: tradeAreaDetailB.residents.value, numValue: tradeAreaDetailB.residents.numValue }
        },
        "총 직장인구": { 
          상권1: { value: tradeAreaDetailA.workers.value, numValue: tradeAreaDetailA.workers.numValue }, 
          상권2: { value: tradeAreaDetailB.workers.value, numValue: tradeAreaDetailB.workers.numValue }
        },
        "상권변화지표": { 
          상권1: { value: tradeAreaDetailA.changeIndex.value, numValue: 0 }, 
          상권2: { value: tradeAreaDetailB.changeIndex.value, numValue: 0 }
        }
      });
    } else {
      setComparisonData(null);
    }
  }, [tradeAreaDetailA, tradeAreaDetailB]);

  const options = comparisonData ? Object.keys(comparisonData) : [];

  // 모달이 열리지 않으면 렌더링하지 않음
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[40]">
      {/* 배경 오버레이 - 왼쪽 사이드바 영역 제외 */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        style={{ marginLeft: navbarOpen ? '25%' : '0%' }} // 사이드바 상태에 따라 조정
      />
      
      {/* 모달 컨테이너 - 사이드바 상태에 따라 크기 조정 */}
      <div 
        className="absolute top-0 right-0 h-full bg-white shadow-2xl overflow-hidden"
        style={{ width: navbarOpen ? '75%' : '100%' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900">상권 비교</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 - 스크롤 가능 */}
        <div className="p-8 h-full overflow-y-auto">
          {/* 상권 선택 섹션 */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* 상권 1 선택 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3288FF' }}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">상권 1</h3>
              </div>
              <TradeAreaPicker
                title="상권 1"
                value={selectionA}
                onChange={setSelectionA}
                accentColor="#3288FF"
                backgroundColor="#f0f8ff"
              />
            </div>

            {/* 상권 2 선택 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5AB8E2' }}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">상권 2</h3>
              </div>
              <TradeAreaPicker
                title="상권 2"
                value={selectionB}
                onChange={setSelectionB}
                accentColor="#5AB8E2"
                backgroundColor="#f0fdfa"
              />
            </div>
          </div>

           {/* 옵션 비교 섹션 - 상권이 모두 선택되었을 때만 표시 */}
           {selectionA.tradeAreaCode && selectionB.tradeAreaCode && comparisonData && (
             <div className="relative">
               {/* 가운데 컬럼 - 세로로 이어지는 배경 */}
               <div className="absolute left-1/2 transform -translate-x-1/2 w-48 bg-white shadow-lg border-l border-r border-gray-200 h-full z-10">
                 <div className="py-0">
                   {options.map((option, index) => (
                     <div key={option} className="px-4 py-6 border-b border-gray-100 last:border-b-0 h-16 flex items-center">
                       <h4 className="text-sm font-semibold text-gray-900 text-center w-full">{option}</h4>
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* 비교 데이터 행들 */}
               <div className="space-y-0">
                 {options.map((option, index) => {
                   const data1 = comparisonData[option].상권1;
                   const data2 = comparisonData[option].상권2;
                   
                   // 상권변화지표는 막대 그래프 대신 텍스트만 표시
                   if (option === "상권변화지표") {
                     return (
                       <div key={option} className="relative flex items-center h-16 py-2">
                         {/* 상권 1 - 왼쪽 */}
                         <div className="flex-1 flex justify-end">
                           <div className="rounded-lg px-4 py-2 min-w-32" style={{ backgroundColor: '#f0f8ff', border: '1px solid #3288FF' }}>
                             <span className="text-sm font-semibold" style={{ color: '#3288FF' }}>
                               상권 확장
                             </span>
                           </div>
                         </div>
                         
                         {/* 가운데 컬럼 공간 - 실제 내용은 위의 절대 위치 요소에 있음 */}
                         <div className="w-48"></div>
                         
                         {/* 상권 2 - 오른쪽 */}
                         <div className="flex-1 flex justify-start">
                           <div className="rounded-lg px-4 py-2 min-w-32" style={{ backgroundColor: '#f0fdfa', border: '1px solid #5AB8E2' }}>
                             <span className="text-sm font-semibold" style={{ color: '#5AB8E2' }}>
                               다이나믹
                             </span>
                           </div>
                         </div>
                       </div>
                     );
                   }

                  // 숫자 데이터는 막대 그래프로 표시
                  const isPopulationData = option === "총 유동인구" || option === "총 상주인구" || option === "총 직장인구";
                  
                  let width1, width2;
                  
                  if (isPopulationData) {
                    // 인구 데이터: 통합 데이터셋 기준 정규화 + 최소 길이 보장
                    const populationOptions = ["총 유동인구", "총 상주인구", "총 직장인구"];
                    const allPopulationValues: number[] = [];
                    
                    // 모든 인구 데이터 수집
                    populationOptions.forEach(popOption => {
                      if (comparisonData[popOption]) {
                        allPopulationValues.push(comparisonData[popOption].상권1.numValue);
                        allPopulationValues.push(comparisonData[popOption].상권2.numValue);
                      }
                    });
                    
                    // 통합 최대값 계산
                    const globalMaxValue = Math.max(...allPopulationValues);
                    
                    // 최소 길이 12% 보장
                    const minWidth = 12;
                    const availableWidth = 100 - minWidth;
                    
                    if (globalMaxValue === 0) {
                      width1 = width2 = 50;
                    } else {
                      // 통합 최대값 기준으로 정규화
                      const normalized1 = data1.numValue / globalMaxValue;
                      const normalized2 = data2.numValue / globalMaxValue;
                      
                      width1 = minWidth + (normalized1 * availableWidth);
                      width2 = minWidth + (normalized2 * availableWidth);
                    }
                  } else {
                    // 기존 방식: 선형 스케일
                    const maxValue = Math.max(data1.numValue, data2.numValue);
                    width1 = maxValue > 0 ? (data1.numValue / maxValue) * 100 : 0;
                    width2 = maxValue > 0 ? (data2.numValue / maxValue) * 100 : 0;
                  }

                   return (
                     <div key={option} className="relative flex items-center h-16 py-2">
                       {/* 상권 1 - 왼쪽 막대 */}
                       <div className="flex-1 flex justify-end">
                         <div 
                           className="rounded-l-full h-12 flex items-center justify-end pr-2 text-white font-bold text-sm transition-all duration-500"
                           style={{ 
                             width: `${width1}%`,
                             background: 'linear-gradient(to left, #3288FF, #1e6bcc)'
                           }}
                         >
                           {data1.value}
                         </div>
                       </div>
                       
                       {/* 가운데 컬럼 공간 - 실제 내용은 위의 절대 위치 요소에 있음 */}
                       <div className="w-48"></div>
                       
                       {/* 상권 2 - 오른쪽 막대 */}
                       <div className="flex-1 flex justify-start">
                         <div 
                           className="rounded-r-full h-12 flex items-center justify-start pl-2 text-white font-bold text-sm transition-all duration-500"
                           style={{ 
                             width: `${width2}%`,
                             background: 'linear-gradient(to right, #5AB8E2, #3a9bc1)'
                           }}
                         >
                           {data2.value}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">데이터를 불러오는 중...</div>
            </div>
          )}

          {/* 상권 선택 안내 메시지 */}
          {!loading && (!selectionA.tradeAreaCode || !selectionB.tradeAreaCode) && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {!selectionA.tradeAreaCode && !selectionB.tradeAreaCode 
                  ? "상권 1과 상권 2를 모두 선택해주세요"
                  : !selectionA.tradeAreaCode 
                    ? "상권 1을 선택해주세요"
                    : "상권 2를 선택해주세요"
                }
              </div>
              <p className="text-gray-400 text-sm">
                자치구 → 행정동 → 상권 순서로 선택하시면 비교 데이터를 확인할 수 있습니다
              </p>
            </div>
          )}

          {/* 하단 텍스트 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed">
              Qualisque patrioque vis in. Eum ea fabulas persecuti, mutat facer omnesque at ius. 
              Mel in quas vocent. Dicit graeco scaevola usu no. Cu nostrud intellegat vel, 
              aliquid conclusionemque no vel. An mel salutandi incorrupte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
