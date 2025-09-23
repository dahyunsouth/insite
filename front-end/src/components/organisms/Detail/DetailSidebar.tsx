"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import ActionButtons from "@/components/atoms/Detail/ActionButtons";
import { useFavorites } from "@/contexts/FavoritesContext";
import { authManager } from "@/utils/auth";
import { useNotification } from "@/components/map/useNotification";
import Notification from "@/components/map/Notification";
import DetailNavbarTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import ScoreCard from "@/components/molecules/Detail/ScoreCard/ScoreCard";
import MarketChangeIndicatorCard from "@/components/molecules/Detail/MarketChangeIndicator/MarketChangeIndicatorCard";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import SalesCard from "@/components/molecules/Detail/SalesCard/SalesCard";
import StoreCard from "@/components/molecules/Detail/StoreCard/StoreCard";
type DetailNavbarProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  trdarCode?: string | null;
  onSelectTradeArea?: (opt: { code: string; name: string } | null) => void;
  onAddToComparison?: (trdarCd: string, trdarCdNm: string) => void;
  onRemoveFromComparison?: (trdarCd: string) => void;
  isInComparison?: (trdarCd: string) => boolean;
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
};

type DetailSidebarProps = {
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
  onCompare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
  isLoading?: boolean;
  error?: string | null;
};
/**
 * Organism: DetailNavbar
 * - Renders portal + backdrop + ESC close
 * - Uses the Detail template for visuals (container/header/section-nav)
 */
export function DetailNavbar({ open, onClose, title, subtitle, trdarCode, onSelectTradeArea, onAddToComparison, onRemoveFromComparison, isInComparison, populationType, onPopulationTypeChange }: DetailNavbarProps) {
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();
  
  // Context에서 즐겨찾기 관련 상태와 함수 가져오기
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // 비교함 상태에 따라 isComparing 동기화
  useEffect(() => {
    const currentCode = getCurrentTrdarCode();
    if (currentCode && isInComparison) {
      setIsComparing(isInComparison(currentCode));
    }
  }, [trdarCode, selected, isInComparison]);

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

  // 현재 상권 코드 가져오기
  const getCurrentTrdarCode = (): string | null => {
    return trdarCode ?? selected?.code ?? null;
  };

  // 현재 상권이 저장되어 있는지 확인
  const getCurrentIsSaved = (): boolean => {
    const currentCode = getCurrentTrdarCode();
    if (!currentCode) return false;
    return isFavorite(parseInt(currentCode));
  };

  const handleCompare = () => {
    const currentCode = getCurrentTrdarCode();
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
      showNotification('비교함에서 제거되었습니다.');
    } else {
      // 비교함에 추가 - HomePage에서 토스트 알림을 처리하므로 여기서는 제거
      onAddToComparison?.(currentCode, currentTrdarCdNm);
      setIsComparing(true);
      // showNotification('비교함에 추가되었습니다.'); // 제거 - HomePage에서 처리
    }
    
    console.log("비교하기 클릭:", currentCode, "비교 상태:", !isCurrentlyInComparison);
  };

  const handleSave = async () => {
    console.log('💾 [DetailSidebar] handleSave 함수 시작');
    const currentCode = getCurrentTrdarCode();
    console.log('💾 [DetailSidebar] 현재 상권 코드:', currentCode);
    
    if (!currentCode) {
      console.error('💾 [DetailSidebar] 상권 코드가 없음');
      setError('상권 정보를 찾을 수 없습니다.');
      return;
    }

    // 로그인 확인
    const isLoggedIn = authManager.isLoggedIn();
    console.log('💾 [DetailSidebar] 로그인 상태:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('💾 [DetailSidebar] 로그인 필요 - 에러 설정');
      setError('로그인이 필요합니다.');
      return;
    }

    console.log('💾 [DetailSidebar] 로딩 시작');
    setIsLoading(true);
    setError(null);

    try {
      const currentIsSaved = getCurrentIsSaved();
      const currentTrdarCdNm = selected?.name || title || '상권';
      
      console.log('💾 [DetailSidebar] 현재 저장 상태:', currentIsSaved);
      console.log('💾 [DetailSidebar] 상권명:', currentTrdarCdNm);
      
      if (currentIsSaved) {
        // 저장 해제
        console.log('💾 [DetailSidebar] 저장 해제 API 호출 시작');
        await removeFavorite(parseInt(currentCode));
        showNotification('상권이 저장 목록에서 제거되었습니다.');
        console.log('✅ [DetailSidebar] 상권 저장 해제 성공:', currentCode);
      } else {
        // 저장
        console.log('💾 [DetailSidebar] 저장 API 호출 시작');
        await addFavorite(parseInt(currentCode), currentTrdarCdNm);
        showNotification('상권이 저장되었습니다.');
        console.log('✅ [DetailSidebar] 상권 저장 성공:', currentCode);
      }
      setError(null); // 성공 시 에러 메시지 제거
    } catch (error) {
      console.error('❌ [DetailSidebar] 상권 저장/해제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '저장 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      showNotification(errorMessage);
    } finally {
      console.log('💾 [DetailSidebar] 로딩 종료');
      setIsLoading(false);
    }
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
              isSaved={getCurrentIsSaved()}
              isComparing={isComparing}
              isLoading={isLoading}
              error={error}
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
                onPopulationTypeChange={onPopulationTypeChange}
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
      
      {/* 토스트 알림 */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
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
  isComparing,
  isLoading,
  error
}: { 
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
  onCompare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
  isLoading?: boolean;
  error?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // 인구 타입이 변경될 때 올바른 인덱스로 설정
  useEffect(() => {
    if (activeIndex >= 3 && activeIndex <= 5) { // 인구 섹션이 활성화된 경우
      const correctIndex = populationType === "유동" ? 3 : populationType === "직장" ? 4 : 5;
      if (activeIndex !== correctIndex) {
        setActiveIndex(correctIndex);
      }
    }
  }, [populationType, activeIndex]);
  const items = [
    { id: "intro-section", label: "상권 소개" },
    { id: "score-section", label: "종합 추천 점수" },
    { id: "market-change-section", label: "상권 변화 지표" },
    { id: "population-section", label: "인구", isParent: true },
    { id: "pop-section", label: "유동인구", parentId: "population-section", populationType: "유동" },
    { id: "pop-section", label: "직장인구", parentId: "population-section", populationType: "직장" },
    { id: "pop-section", label: "상주인구", parentId: "population-section", populationType: "상주" },
    { id: "sales-section", label: "매출" },
    { id: "store-section", label: "점포" },
  ];

  // 개선된 스크롤 하이라이터 로직
  useEffect(() => {
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
      if (sectionId === 'intro-section') return 0;
      if (sectionId === 'score-section') return 1;
      if (sectionId === 'market-change-section') return 2;
      if (sectionId === 'pop-section') {
        if (populationType === '유동') return 4;
        if (populationType === '직장') return 5;
        if (populationType === '상주') return 6;
      }
      if (sectionId === 'sales-section') return 7;
      if (sectionId === 'store-section') return 8;
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
          if (lastActiveIndex !== 8) {
            lastActiveIndex = 8;
            setActiveIndex(8); // 점포
          }
          return;
        } else if (!atBottom && isAtBottom) {
          isAtBottom = false;
        }
        
        // 중간 영역에서는 가장 가까운 섹션 찾기 (클릭 로직과 동일한 계산 방식 사용)
        if (!isAtTop && !isAtBottom) {
          const sections = ['intro-section', 'score-section', 'market-change-section', 'pop-section', 'sales-section', 'store-section'];
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
      <nav aria-label="섹션 내비게이션" className="rounded-[30px] border border-gray-300 bg-white p-8">
        <ul className="flex flex-col">
          {items.map((it, idx) => {
            const isActive = idx === activeIndex;
            const isChild = it.parentId;
            const itemPopulationType = (it as { populationType?: string }).populationType;
            
            // 인구 항목의 경우 토글 상태와 일치하고, 현재 인구 섹션이 활성화된 경우에만 하이라이트
            const isPopulationSectionActive = activeIndex >= 4 && activeIndex <= 6; // 인구 섹션들 (유동인구, 직장인구, 상주인구)
            const isPopulationItemActive = itemPopulationType && itemPopulationType === populationType && isPopulationSectionActive;
            
            // 하위 항목이 활성화되면 부모 항목도 활성화 상태로 표시
            const activeItem = items[activeIndex];
            const isParentOfActiveChild = it.isParent && activeItem?.parentId === it.id;
            
            // 인구 섹션의 경우, 정확한 인구 타입 매칭만 허용
            // 인구 자식 항목들은 정확한 타입 매칭만 허용
            const isPopulationChild = itemPopulationType !== undefined;
            const shouldHighlight = isActive || isParentOfActiveChild || (isPopulationChild ? isPopulationItemActive : false);
            
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
      
      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 액션 버튼들 */}
      <ActionButtons 
        onCompare={onCompare}
        onSave={onSave}
        isSaved={isSaved}
        isComparing={isComparing}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * Organism: DetailSidebar
 * - Manages the right side navigation and action buttons
 * - Handles scroll highlighting and navigation
 */
export default function DetailSidebar({ 
  populationType, 
  onPopulationTypeChange,
  onCompare,
  onSave,
  isSaved,
  isComparing
}: DetailSidebarProps) {
  return (
    <DetailAsideNav
      populationType={populationType}
      onPopulationTypeChange={onPopulationTypeChange}
      onCompare={onCompare}
      onSave={onSave}
      isSaved={isSaved}
      isComparing={isComparing}
      isLoading={false}
      error={null}
    />
  );
}
