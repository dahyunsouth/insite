"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DetailNavbarTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import TradeAreaSelect from "@/components/molecules/Detail/TradeAreaSelect";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import StoreCard from "@/components/molecules/Detail/StoreCard/StoreCard";
import ScoreCard from "@/components/molecules/Detail/ScoreCard";
import SalesCard from "@/components/molecules/Detail/SalesCard/SalesCard";
import MarketChangeIndicatorCard from "@/components/molecules/Detail/MarketChangeIndicator/MarketChangeIndicatorCard";
import ActionButtons from "@/components/atoms/Detail/ActionButtons";

type DetailNavbarProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  trdarCode?: string | null;
  onSelectTradeArea?: (opt: { code: string; name: string } | null) => void;
};

/**
 * Organism: DetailNavbar
 * - Renders portal + backdrop + ESC close
 * - Uses the Detail template for visuals (container/header/section-nav)
 */
export default function DetailNavbar({ open, onClose, title, subtitle, trdarCode, onSelectTradeArea }: DetailNavbarProps) {
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
    console.log("[DetailNavbar] selection changed:", selected, "computedTitle:", computedTitle);
  }, [selected, computedTitle]);

  const handleCompare = () => {
    setIsComparing(!isComparing);
    console.log("비교하기 클릭:", selected, "비교 상태:", !isComparing);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log("저장하기 클릭:", selected, "저장 상태:", !isSaved);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* backdrop
      <div className="absolute inset-0 bg-black/30" onClick={onClose} /> */}

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
            //     console.log("[DetailNavbar] dropdown onChange:", opt);
            //     setSelected(opt);
            //     onSelectTradeArea?.(opt);
            //   }}
            // />
            null
          }
          sectionAside={
            <DetailAsideNav 
              populationType={populationType} 
              onPopulationTypeChange={setPopulationType}
              onCompare={handleCompare}
              onSave={handleSave}
              isSaved={isSaved}
              isComparing={isComparing}
            />
          }
        >
          <>
            <section id="score-section" className="scroll-mt-64">
              <ScoreCard trdarCode={selected?.code ?? null} />
            </section>
            <section id="market-change-section" className="scroll-mt-64">
              <MarketChangeIndicatorCard trdarCode={trdarCode ?? selected?.code ?? null} />
            </section>
            <section id="pop-section" className="scroll-mt-64">
              <TimeSlotCard 
                trdarCode={trdarCode ?? selected?.code ?? null} 
                populationType={populationType}
                onPopulationTypeChange={setPopulationType}
              />
              {/* Debug: trdarCode = {trdarCode ?? selected?.code ?? null} */}
            </section>
            <section id="sales-section" className="scroll-mt-64">
              <SalesCard trdarCode={trdarCode ?? selected?.code ?? null} />
            </section>
            <section id="store-section" className="scroll-mt-64">
              <StoreCard trdarCode={trdarCode ?? selected?.code ?? null} />
            </section>
          </>
        </DetailNavbarTemplate>
      </div>
    </div>,
    document.body
  );
}

function DetailAsideNav({ 
  populationType, 
  onPopulationTypeChange,
  onCompare,
  onSave,
  isSaved,
  isComparing
}: { 
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
  onCompare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
}) {
  const items = [
    { id: "score-section", label: "종합추천점수" },
    { id: "market-change-section", label: "상권 변화 지표" },
    { id: "population-section", label: "인구", isParent: true },
    { id: "pop-section", label: "유동인구", parentId: "population-section", populationType: "유동" },
    { id: "pop-section", label: "직장인구", parentId: "population-section", populationType: "직장" },
    { id: "pop-section", label: "상주인구", parentId: "population-section", populationType: "상주" },
    { id: "sales-section", label: "매출" },
    { id: "store-section", label: "점포" },
  ];
  const [activeIndex, setActiveIndex] = React.useState(0);

  // 개선된 스크롤 하이라이터 로직
  React.useEffect(() => {
    // 모달 컨테이너 찾기 - 여러 방법 시도
    let modalContainer = document.querySelector('[style*="backgroundColor: #F8F9FA"].overflow-y-auto') as HTMLElement;
    
    if (!modalContainer) {
      // 대안 방법: DetailNavbarTemplate의 특정 구조를 찾기
      modalContainer = document.querySelector('.rounded-3xl.overflow-y-auto') as HTMLElement;
    }
    
    if (!modalContainer) {
      // 최종 대안: 모든 overflow-y-auto 요소 중에서 가장 큰 것 선택
      const containers = document.querySelectorAll('.overflow-y-auto');
      if (containers.length > 0) {
        modalContainer = Array.from(containers).find(container => 
          container.scrollHeight > container.clientHeight
        ) as HTMLElement || containers[0] as HTMLElement;
      }
    }
    
    if (!modalContainer) {
      console.warn('Modal container not found for scroll highlighting');
      return;
    }
    

    let scrollTimeout: NodeJS.Timeout;
    let isAtTop = false;
    let isAtBottom = false;
    let lastActiveIndex = activeIndex; // 이전 상태를 추적하여 불필요한 리렌더링 방지

    const getSectionIndex = (sectionId: string) => {
      if (sectionId === 'score-section') return 0;
      if (sectionId === 'market-change-section') return 1;
      if (sectionId === 'pop-section') {
        if (populationType === '유동') return 3;
        if (populationType === '직장') return 4;
        if (populationType === '상주') return 5;
      }
      if (sectionId === 'sales-section') return 6;
      if (sectionId === 'store-section') return 7;
      return 0;
    };

    const handleScroll = () => {
      // 사용자가 클릭 중일 때는 스크롤 감지 무시
      if (modalContainer.hasAttribute('data-user-clicking')) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = modalContainer;
        
        // 스크롤 가능한 높이가 충분하지 않으면 종합추천점수로 설정
        if (scrollHeight <= clientHeight) {
          if (lastActiveIndex !== 0) {
            lastActiveIndex = 0;
            setActiveIndex(0);
          }
          return;
        }
        
        const scrollPercent = scrollTop / (scrollHeight - clientHeight);
        
        // 최상단 감지 (스크롤이 상단 10% 이내)
        const atTop = scrollPercent <= 0.1;
        if (atTop && !isAtTop) {
          isAtTop = true;
          isAtBottom = false;
          if (lastActiveIndex !== 0) {
            lastActiveIndex = 0;
            setActiveIndex(0); // 종합추천점수
          }
          return;
        } else if (!atTop && isAtTop) {
          isAtTop = false;
        }
        
        // 최하단 감지 (스크롤이 하단 10% 이내)
        const atBottom = scrollPercent >= 0.9;
        if (atBottom && !isAtBottom) {
          isAtBottom = true;
          isAtTop = false;
          if (lastActiveIndex !== 7) {
            lastActiveIndex = 7;
            setActiveIndex(7); // 점포
          }
          return;
        } else if (!atBottom && isAtBottom) {
          isAtBottom = false;
        }
        
        // 중간 영역에서는 가장 가까운 섹션 찾기 (클릭 로직과 동일한 계산 방식 사용)
        if (!isAtTop && !isAtBottom) {
          const sections = ['score-section', 'market-change-section', 'pop-section', 'sales-section', 'store-section'];
          let closestSection = sections[0];
          let minDistance = Infinity;
          
          sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
              const rect = element.getBoundingClientRect();
              const containerRect = modalContainer.getBoundingClientRect();
              
              // 클릭 로직과 동일한 계산: 섹션 상단이 화면 상단에서 100px 지점에 가장 가까운 섹션 선택
              const sectionTop = rect.top - containerRect.top;
              const targetPosition = 100; // 클릭 시 사용하는 100px 여백과 동일
              
              // 섹션이 화면에 보이는 경우에만 고려 (더 정확한 범위 설정)
              if (sectionTop <= containerRect.height && sectionTop >= -rect.height) {
                // 섹션이 목표 위치(100px) 위에 있으면 우선순위를 높임
                let distance = Math.abs(sectionTop - targetPosition);
                
                // 섹션이 목표 위치보다 위에 있으면 약간의 가중치를 줘서 더 쉽게 선택되도록 함
                if (sectionTop <= targetPosition) {
                  distance *= 0.8; // 20% 가중치 감소
                }
                
                if (distance < minDistance) {
                  minDistance = distance;
                  closestSection = sectionId;
                }
              }
            }
          });
          
          const targetIndex = getSectionIndex(closestSection);
          if (targetIndex !== lastActiveIndex) {
            lastActiveIndex = targetIndex;
            setActiveIndex(targetIndex);
          }
        }
      }, 16); // 60fps에 맞춘 디바운스로 조정하여 안정성 향상
    };

    // 초기 설정
    handleScroll();
    
    // 스크롤 이벤트 리스너 추가
    modalContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      modalContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [populationType]);
  function go(id: string, idx: number, itemPopulationType?: string) {
    
    // 사용자 클릭 상태 설정 (스크롤 감지 일시 중단)
    const modalContainer = document.querySelector('[style*="backgroundColor: #F8F9FA"].overflow-y-auto') as HTMLElement;
    if (modalContainer) {
      // 클릭 상태를 나타내는 데이터 속성 설정
      modalContainer.setAttribute('data-user-clicking', 'true');
      setTimeout(() => {
        modalContainer.removeAttribute('data-user-clicking');
      }, 500); // 500ms 후 클릭 상태 해제
    }
    
    // 인구 부모 섹션 클릭 시 바로 유동인구 섹션으로 처리
    if (id === "population-section") {
      // 유동인구 섹션으로 직접 이동
      const popSection = document.getElementById("pop-section");
      if (popSection) {
        const modalContainer = popSection.closest('.overflow-y-auto');
        if (modalContainer) {
          const rect = popSection.getBoundingClientRect();
          const containerRect = modalContainer.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top;
          const scrollTop = modalContainer.scrollTop;
          
          const targetPosition = scrollTop + relativeTop - 100; // 스크롤 하이라이터와 동일한 100px 여백
          modalContainer.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth"
          });
        }
      }
      setActiveIndex(2); // 유동인구 항목 인덱스
      onPopulationTypeChange("유동");
      return;
    }
    
    const el = document.getElementById(id);
    if (el) {
      // 모달 내부 스크롤 컨테이너를 찾아서 스크롤
      const modalContainer = el.closest('.overflow-y-auto');
      if (modalContainer) {
        const rect = el.getBoundingClientRect();
        const containerRect = modalContainer.getBoundingClientRect();
        
        // 모달 컨테이너 내에서의 상대적 위치 계산
        const relativeTop = rect.top - containerRect.top;
        const scrollTop = modalContainer.scrollTop;
        
        const targetPosition = scrollTop + relativeTop - 100; // 스크롤 하이라이터와 동일한 100px 여백
        
        
        modalContainer.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth"
        });
      } else {
        // fallback: 기본 scrollIntoView
        el.scrollIntoView({ 
          behavior: "smooth", 
          block: "start"
        });
      }
      
      // 인구 섹션 클릭 시 해당 토글 상태로 설정하고 올바른 인덱스 설정
      if (id === "pop-section" && itemPopulationType) {
        onPopulationTypeChange(itemPopulationType as "유동" | "직장" | "상주");
        // 인구 타입에 따라 올바른 인덱스 설정
        if (itemPopulationType === "유동") {
          setActiveIndex(3);
        } else if (itemPopulationType === "직장") {
          setActiveIndex(4);
        } else if (itemPopulationType === "상주") {
          setActiveIndex(5);
        }
      } else {
        setActiveIndex(idx);
      }
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="섹션 내비게이션" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <ul className="flex flex-col">
          {items.map((it, idx) => {
            const isActive = idx === activeIndex;
            const isChild = it.parentId;
            const itemPopulationType = (it as { populationType?: string }).populationType;
            
            // 인구 항목의 경우 토글 상태와 일치하고, 현재 인구 섹션이 활성화된 경우에만 하이라이트
            const isPopulationSectionActive = activeIndex >= 2 && activeIndex <= 4; // 인구 섹션들 (유동인구, 직장인구, 상주인구)
            const isPopulationItemActive = itemPopulationType && itemPopulationType === populationType && isPopulationSectionActive;
            
            // 하위 항목이 활성화되면 부모 항목도 활성화 상태로 표시
            const activeItem = items[activeIndex];
            const isParentOfActiveChild = it.isParent && activeItem?.parentId === it.id;
            const shouldHighlight = isActive || isParentOfActiveChild || isPopulationItemActive;
            
            return (
              <li key={`${it.id}-${itemPopulationType || idx}`} className={idx !== 0 ? "mt-3" : undefined}>
                <button
                  type="button"
                  onClick={() => go(it.id, idx, itemPopulationType)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    "cursor-pointer w-full text-left text-base leading-6 " +
                    (shouldHighlight ? "text-[#3288FF] font-semibold" : "text-gray-400 hover:text-gray-600") +
                    (isChild ? " ml-4" : "")
                  }
                >
                  {it.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* 액션 버튼들 */}
      <ActionButtons 
        onCompare={onCompare}
        onSave={onSave}
        isSaved={isSaved}
        isComparing={isComparing}
      />
    </div>
  );
}
