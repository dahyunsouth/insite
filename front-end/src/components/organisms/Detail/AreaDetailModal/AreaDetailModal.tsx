"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AreaDetailModalTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import TradeAreaSelect from "@/components/molecules/Detail/TradeAreaSelect";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import StoreCard from "@/components/molecules/Detail/StoreCard";
import ScoreCard from "@/components/molecules/Detail/ScoreCard";
import SalesCard from "@/components/molecules/Detail/SalesCard";

type AreaDetailModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSelectTradeArea?: (opt: { code: string; name: string } | null) => void;
};

/**
 * Organism: AreaDetailModal
 * - Renders portal + backdrop + ESC close
 * - Uses the Detail template for visuals (container/header/section-nav)
 */
export default function AreaDetailModal({ open, onClose, title, subtitle, onSelectTradeArea }: AreaDetailModalProps) {
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);
  const [populationType, setPopulationType] = useState<"유동" | "직장" | "상주">("유동");

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
    console.log("[AreaDetailModal] selection changed:", selected, "computedTitle:", computedTitle);
  }, [selected, computedTitle]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* backdrop
      <div className="absolute inset-0 bg-black/30" onClick={onClose} /> */}

      {/* modal */}
      <div className="relative z-10 w-[calc(75vw-1rem)] mt-2 mr-2" onClick={(e) => e.stopPropagation()}>
        <AreaDetailModalTemplate
          title={computedTitle}
          subtitle={subtitle}
          onClose={onClose}
          headerRight={
            <TradeAreaSelect
              onChange={(opt) => {
                // Debug log: dropdown change event
                // eslint-disable-next-line no-console
                console.log("[AreaDetailModal] dropdown onChange:", opt);
                setSelected(opt);
                onSelectTradeArea?.(opt);
              }}
            />
          }
          sectionAside={<DetailAsideNav populationType={populationType} onPopulationTypeChange={setPopulationType} />}
        >
          <>
            <section id="score-section" className="scroll-mt-64">
              <ScoreCard trdarCode={selected?.code ?? null} />
            </section>
            <section id="pop-section" className="scroll-mt-64">
              <TimeSlotCard 
                trdarCode={selected?.code ?? null} 
                populationType={populationType}
                onPopulationTypeChange={setPopulationType}
              />
            </section>
            <section id="sales-section" className="scroll-mt-64">
              <SalesCard trdarCode={selected?.code ?? null} />
            </section>
            <section id="store-section" className="scroll-mt-64">
              <StoreCard trdarCode={selected?.code ?? null} />
            </section>
          </>
        </AreaDetailModalTemplate>
      </div>
    </div>,
    document.body
  );
}

function DetailAsideNav({ 
  populationType, 
  onPopulationTypeChange 
}: { 
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
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
  );
}
