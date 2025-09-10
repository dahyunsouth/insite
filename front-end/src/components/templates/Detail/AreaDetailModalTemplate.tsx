"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type AreaDetailModalTemplateProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  /** Header text alignment */
  headerAlign?: "left" | "center";
  /** Left column first card title (e.g., 유동인구) */
  sectionTitle?: React.ReactNode;
  /** Right-side aside content (vertical nav, filters, etc.) */
  sectionAside?: React.ReactNode;
  /** Deprecated alias for aside content */
  sectionNav?: React.ReactNode;
  /** Left column custom content; when absent, a population-card skeleton is shown */
  children?: React.ReactNode;
};

/**
 * Template: Detail/AreaDetailModalTemplate
 * - Pure layout/visuals only (no portal/keyboard handling here)
 * - Container bg: #F8F9FA, header/section bg: #FFFFFF
 * - Aside lives to the RIGHT of the cards, not inside the first card
 */
export default function AreaDetailModalTemplate({
  title,
  subtitle,
  onClose,
  className,
  headerAlign = "left",
  sectionTitle,
  sectionAside,
  sectionNav,
  children,
}: AreaDetailModalTemplateProps) {
  const asideNode = sectionAside ?? sectionNav;

  return (
    <div
      className={
        "relative w-[1000px] rounded-3xl border border-black/5 shadow-xl max-h-[85vh] overflow-y-auto " +
        (className ?? "")
      }
      style={{ backgroundColor: "#F8F9FA" }}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm"
      >
        <XMarkIcon className="h-5 w-5 text-gray-700" />
      </button>

      {/* Header */}
      <div className="rounded-t-3xl border-b border-black/5" style={{ backgroundColor: "#FFFFFF" }}>
        <div className={"px-6 py-4 " + (headerAlign === "center" ? "text-center" : "text-left")}>
          {title && <h2 className="text-[20px] font-semibold text-[#3288FF]">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {/* Content: left cards stack + right aside (separate from cards) */}
      <main className="px-4 pb-6">
        <div className="md:grid md:grid-cols-[1fr_240px] md:gap-6">
          {/* Left column: stack of section cards */}
          <div>
            <div
              className="rounded-[30px] border border-[#D9D9D9] overflow-hidden"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div className="p-[30px]">
                {children ?? (
                  <DefaultPopulationCardSkeleton sectionTitle={sectionTitle} />
                )}
              </div>
            </div>
          </div>

          {/* Right column: aside menu (sticky) */}
          <aside className="hidden md:block md:sticky md:top-6 self-start">
            {asideNode ?? <DefaultVerticalPills />}
          </aside>
        </div>
      </main>
    </div>
  );
}

function DefaultVerticalPills() {
  const items = ["최신 상권 종합 평가", "유동인구", "소비금액", "대중교통 승하차"];
  const activeIndex = 0; // 디자인 샘플: 첫 항목 강조
  return (
    <nav aria-label="섹션 내비게이션" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <ul className="flex flex-col">
        {items.map((t, idx) => {
          const isActive = idx === activeIndex;
          return (
            <li key={t} className={idx !== 0 ? "mt-3" : undefined}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={
                  "w-full text-left text-base leading-6 " +
                  (isActive ? "text-[#3288FF] font-semibold" : "text-gray-400 hover:text-gray-600")
                }
              >
                {t}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DefaultPopulationCardSkeleton({
  sectionTitle,
}: {
  sectionTitle?: React.ReactNode;
}) {
  return (
    <div>
      {/* Section title */}
      <h3 className="text-[18px] font-semibold text-gray-900">{sectionTitle ?? "유동인구"}</h3>

      {/* Segmented control (static, full width) */}
      <div className="mt-4 w-full rounded-xl bg-gray-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button className="w-full justify-center rounded-xl bg-white px-4 py-4 text-sm font-medium text-[#3288FF] shadow-sm">요일별 추이</button>
          <button className="w-full justify-center rounded-xl px-4 py-4 text-sm font-medium text-gray-500">월별 추이</button>
        </div>
      </div>

      {/* Highlight statement */}
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-gray-900">
        <span className="font-medium">강조 문장</span>이 들어갈 영역입니다.
        <span className="ml-1 font-bold text-rose-500">핵심 단어</span> 표시만 스타일로 표현합니다.
      </div>

      {/* Caption (right-aligned) */}
      <div className="mt-1 text-right text-xs text-gray-400">최근 28일 기준</div>

      {/* Blue metric line */}
      <div className="mt-4 text-[15px] font-semibold text-[#3288FF]">지표 라인 텍스트(예: 해당 요일의 유동인구: 30,000명)</div>

      {/* Two-column summary */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
        <div className="grid grid-cols-2">
          <div className="border-b border-gray-200 bg-[#EAF3FF] px-4 py-4 text-center text-sm font-semibold text-gray-800">유동인구가 가장 많은 요일</div>
          <div className="border-b border-l border-gray-200 bg-[#EAF3FF] px-4 py-4 text-center text-sm font-semibold text-gray-800">유동인구가 가장 적은 요일</div>
          <div className="px-4 py-4 text-center text-gray-800">화요일</div>
          <div className="border-l border-gray-200 px-4 py-4 text-center text-gray-800">일요일</div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="mt-4 flex h-[240px] items-center justify-center rounded-2xl border border-gray-200 text-gray-400">
        차트 영역
      </div>
    </div>
  );
}
