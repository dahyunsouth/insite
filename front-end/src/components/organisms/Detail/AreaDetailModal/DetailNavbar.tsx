"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DetailNavbarTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import TradeAreaSelect from "@/components/molecules/Detail/TradeAreaSelect";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import StoreCard from "@/components/molecules/Detail/StoreCard/StoreCard";
import ScoreCard from "@/components/molecules/Detail/ScoreCard";
import SalesCard from "@/components/molecules/Detail/SalesCard/SalesCard";
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
    { id: "population-section", label: "인구", isParent: true },
    { id: "pop-section", label: "유동인구", parentId: "population-section", populationType: "유동" },
    { id: "pop-section", label: "직장인구", parentId: "population-section", populationType: "직장" },
    { id: "pop-section", label: "상주인구", parentId: "population-section", populationType: "상주" },
    { id: "sales-section", label: "매출" },
    { id: "store-section", label: "점포" },
  ];
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Intersection Observer를 사용한 스크롤 감지
  React.useEffect(() => {
    const observerOptions = {
      root: null, // viewport를 root로 사용
      rootMargin: '-10% 0px -70% 0px', // 상단 10% 지점에서 감지 시작
      threshold: 0
    };

    let isAtBottom = false; // 최하단 상태를 추적하는 플래그

    const observer = new IntersectionObserver((entries) => {
      // 최하단이면 Intersection Observer 무시
      if (isAtBottom) return;

      // 현재 화면에 보이는 섹션들과 그 위치 정보를 수집
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => ({
          id: entry.target.id,
          top: entry.boundingClientRect.top
        }))
        .sort((a, b) => a.top - b.top); // 위에서부터 정렬

      if (visibleSections.length > 0) {
        // 가장 위에 있는 섹션을 선택
        const topSection = visibleSections[0].id;
        
        // 해당 섹션에 맞는 인덱스 찾기
        let targetIndex = 0;
        
        if (topSection === 'score-section') {
          targetIndex = 0;
        } else if (topSection === 'pop-section') {
          // 인구 섹션의 경우 현재 populationType에 따라 인덱스 결정
          if (populationType === '유동') targetIndex = 2;
          else if (populationType === '직장') targetIndex = 3;
          else if (populationType === '상주') targetIndex = 4;
        } else if (topSection === 'sales-section') {
          targetIndex = 5;
        } else if (topSection === 'store-section') {
          targetIndex = 6;
        }
        
        setActiveIndex(targetIndex);
      }
    }, observerOptions);

    // 스크롤 최하단 감지를 위한 추가 로직 (디바운스 적용)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const modalContainer = document.querySelector('.overflow-y-auto');
        if (modalContainer) {
          const { scrollTop, scrollHeight, clientHeight } = modalContainer;
          // 더 관대한 최하단 감지 (50px 여백)
          const atBottom = scrollTop + clientHeight >= scrollHeight - 50;
          
          if (atBottom && !isAtBottom) {
            // 최하단에 도달했을 때
            isAtBottom = true;
            setActiveIndex(6); // 점포 섹션으로 설정
          } else if (!atBottom && isAtBottom) {
            // 최하단에서 벗어났을 때 (더 엄격한 조건)
            const reallyNotAtBottom = scrollTop + clientHeight < scrollHeight - 100;
            if (reallyNotAtBottom) {
              isAtBottom = false;
            }
          }
        }
      }, 50); // 50ms 디바운스
    };

    // 관찰할 섹션들 등록
    const sectionsToObserve = ['score-section', 'pop-section', 'sales-section', 'store-section'];
    sectionsToObserve.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    // 스크롤 이벤트 리스너 추가
    const modalContainer = document.querySelector('.overflow-y-auto');
    if (modalContainer) {
      modalContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      observer.disconnect();
      if (modalContainer) {
        modalContainer.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, [populationType]); // populationType이 변경되면 다시 설정
  function go(id: string, idx: number, itemPopulationType?: string) {
    console.log("go function called:", { id, idx, itemPopulationType });
    
    // 인구 부모 섹션 클릭 시 바로 유동인구 섹션으로 처리
    if (id === "population-section") {
      console.log("Population section clicked, redirecting to pop-section");
      // 유동인구 섹션으로 직접 이동
      const popSection = document.getElementById("pop-section");
      if (popSection) {
        const modalContainer = popSection.closest('.overflow-y-auto');
        if (modalContainer) {
          const rect = popSection.getBoundingClientRect();
          const containerRect = modalContainer.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top;
          const scrollTop = modalContainer.scrollTop;
          const targetPosition = scrollTop + relativeTop - 100;
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
        const targetPosition = scrollTop + relativeTop - 100; // 100px 여백
        
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
      
      setActiveIndex(idx);
      
      // 인구 섹션 클릭 시 해당 토글 상태로 설정
      if (id === "pop-section" && itemPopulationType) {
        onPopulationTypeChange(itemPopulationType as "유동" | "직장" | "상주");
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
