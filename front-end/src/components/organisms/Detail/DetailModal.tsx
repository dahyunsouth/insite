"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DetailNavbarTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import DetailContent from "./DetailContent";
import DetailSidebar from "./DetailSidebar";
import TradeAreaRawData from "@/data/TradeAreaValue.json";
import { tmToWgs84 } from "@/utils/coordinateTransform";

// 상권 코드로부터 좌표를 가져오는 함수 (실제 JSON 데이터 사용)
const getCoordinatesFromTrdarCode = (trdarCode: string): { lat: number; lng: number } | undefined => {
  try {
    const tradeArea = TradeAreaRawData.DATA.find((item: any) => item.trdar_cd === trdarCode);
    if (!tradeArea) {
      console.warn('Trade area not found for code:', trdarCode);
      return undefined;
    }

    // TM 좌표를 위도/경도로 변환 (기존 유틸리티 함수 사용)
    const x = tradeArea.xcnts_value;
    const y = tradeArea.ydnts_value;
    
    const converted = tmToWgs84(x, y);
    console.log('DetailModal 좌표 변환 결과:', { trdarCode, x, y, converted });
    return converted;
  } catch (error) {
    console.warn('DetailModal 좌표 변환 실패:', error);
    return undefined;
  }
};

type DetailModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  trdarCode?: string | null;
  onSelectTradeArea?: (opt: { code: string; name: string } | null) => void;
  onAddToComparison?: (trdarCd: string, trdarCdNm: string) => void;
  onRemoveFromComparison?: (trdarCd: string) => void;
  isInComparison?: (trdarCd: string) => boolean;
};

/**
 * Organism: DetailModal (Main Container)
 * - Renders portal + backdrop + ESC close
 * - Uses the Detail template for visuals (container/header/section-nav)
 * - Manages the overall modal state and layout
 */
export default function DetailModal({ open, onClose, title, subtitle, trdarCode, onSelectTradeArea, onAddToComparison, onRemoveFromComparison, isInComparison }: DetailModalProps) {
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);
  const [populationType, setPopulationType] = useState<"유동" | "직장" | "상주">("유동");
  const [isSaved, setIsSaved] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  const computedTitle = useMemo(() => {
    if (selected?.name) {
      const suffix = " 상권 분석";
      return `${selected.name}${suffix}`;
    }
    return title;
  }, [selected, title]);

  useEffect(() => {
    // Debug log: verify selected and computed title changes
    // eslint-disable-next-line no-console
    console.log("[DetailModal] selection changed:", selected, "computedTitle:", computedTitle);
  }, [selected, computedTitle]);

  // 비교함 상태에 따라 isComparing 동기화
  useEffect(() => {
    const currentCode = trdarCode ?? selected?.code ?? null;
    if (currentCode && isInComparison) {
      setIsComparing(isInComparison(currentCode));
    }
  }, [trdarCode, selected, isInComparison]);

  const handleCompare = () => {
    const currentCode = trdarCode ?? selected?.code ?? null;
    const currentTrdarCdNm = selected?.name || title || '상권';
    
    if (!currentCode) {
      console.error('상권 코드가 없습니다.');
      return;
    }

    const isCurrentlyInComparison = isInComparison ? isInComparison(currentCode) : false;
    
    if (isCurrentlyInComparison) {
      // 비교함에서 제거
      onRemoveFromComparison?.(currentCode);
      setIsComparing(false);
      console.log("비교함에서 제거:", currentCode);
    } else {
      // 비교함에 추가
      onAddToComparison?.(currentCode, currentTrdarCdNm);
      setIsComparing(true);
      console.log("비교함에 추가:", currentCode, currentTrdarCdNm);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log("저장하기 클릭:", selected, "저장 상태:", !isSaved);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* modal */}
      <div className="relative z-10 w-[calc(75vw-1rem)] h-[calc(100vh-1rem)] mt-2 mr-2" onClick={(e) => e.stopPropagation()}>
        <DetailNavbarTemplate
          title={computedTitle}
          subtitle={subtitle}
          onClose={onClose}
          headerRight={
            // 상권 검색 기능 주석처리
            // <TradeAreaSelect
            //   onChange={(opt) => {
            //     // Debug log: dropdown change event
            //     // eslint-disable-next-line no-console
            //     console.log("[DetailModal] dropdown onChange:", opt);
            //     setSelected(opt);
            //     onSelectTradeArea?.(opt);
            //   }}
            // />
            null
          }
          sectionAside={
            <DetailSidebar 
              populationType={populationType} 
              onPopulationTypeChange={setPopulationType}
              onCompare={handleCompare}
              onSave={handleSave}
              isSaved={isSaved}
              isComparing={isComparing}
            />
          }
        >
          <DetailContent
            trdarCode={trdarCode ?? selected?.code ?? null}
            populationType={populationType}
            onPopulationTypeChange={setPopulationType}
            areaName={title || selected?.name}
            coordinates={(() => {
              // trdarCode가 직접 전달된 경우 우선 사용
              const codeToUse = trdarCode || selected?.code;
              const coords = codeToUse ? getCoordinatesFromTrdarCode(codeToUse) : undefined;
              console.log('DetailModal coordinates 전달:', { trdarCode, selected, codeToUse, coords });
              return coords || { lat: 37.501309, lng: 127.039599 }; // 기본값 제공
            })()}
            onViewLargeMap={() => {
              // 홈페이지로 이동하고 해당 상권 중심으로 지도 이동
              console.log('크게보기 클릭:', selected);
              
              // 모달 닫기
              onClose();
              
              // 홈페이지로 이동 (현재 페이지가 홈페이지인 경우 스크롤만 이동)
              if (typeof window !== 'undefined') {
                // URL에 상권 정보를 쿼리 파라미터로 전달
                const codeToUse = trdarCode || selected?.code;
                const coords = codeToUse ? getCoordinatesFromTrdarCode(codeToUse) : undefined;
                const finalCoords = coords || { lat: 37.501309, lng: 127.039599 };
                const areaName = title || selected?.name || '상권';
                
                // URL 파라미터로 상권 정보 전달
                const url = new URL(window.location.href);
                url.searchParams.set('tradeArea', codeToUse || '');
                url.searchParams.set('lat', finalCoords.lat.toString());
                url.searchParams.set('lng', finalCoords.lng.toString());
                url.searchParams.set('areaName', areaName);
                
                // URL 변경 (페이지 새로고침 없이)
                window.history.pushState({}, '', url.toString());
                
                // 지도 중심 이동 이벤트 발생
                window.dispatchEvent(new CustomEvent('focusTradeArea', {
                  detail: {
                    code: codeToUse,
                    name: areaName,
                    coordinates: finalCoords
                  }
                }));
                
                console.log('홈페이지로 이동 및 지도 중심 설정:', { codeToUse, areaName, finalCoords });
              }
            }}
          />
        </DetailNavbarTemplate>
      </div>
    </div>,
    document.body
  );
}
