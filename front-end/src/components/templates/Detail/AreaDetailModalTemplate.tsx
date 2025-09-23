"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type DetailNavbarTemplateProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  headerAlign?: "left" | "center";
  headerRight?: React.ReactNode;
  sectionTitle?: React.ReactNode;
  sectionAside?: React.ReactNode;
  sectionNav?: React.ReactNode;
  children?: React.ReactNode;
  showCloseButton?: boolean;
};

export default function DetailNavbarTemplate({
  title,
  subtitle,
  onClose,
  className,
  headerAlign = "center",
  headerRight,
  sectionTitle,
  sectionAside,
  sectionNav,
  children,
  showCloseButton = true,
}: DetailNavbarTemplateProps) {
  const asideNode = sectionAside ?? sectionNav;

  return (
    <div
      className={
        "relative w-full h-full border border-black/5 shadow-xl overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden " +
        (className ?? "")
      }
      style={{ backgroundColor: "#F8F9FA" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 relative border-b border-black/5 bg-white"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Close button (kept within sticky header) */}
        {showCloseButton && onClose && (
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>
        )}
        <div className={"px-6 py-4 pr-16 " + (headerAlign === "center" ? "text-center" : "text-left") }>
          {title && <h2 className="text-[20px] font-semibold">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {/* Right actions (e.g., trade area dropdown) */}
          {headerRight && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2">
              {headerRight}
            </div>
          )}
        </div>
      </div>

      {/* Content: left cards stack + right aside (separate from cards) */}
      <main className="px-4 py-4">
        <div className="md:grid md:grid-cols-[1fr_240px] gap-4">
          {/* Left column: stack of section cards */}
          <div className="flex flex-col gap-4">
            {children}
          </div>

          {/* Right column: aside menu (sticky, non-scrolling) */}
          <aside className="hidden md:block md:sticky md:top-[68px] self-start">
            {asideNode ?? <DefaultVerticalPills />}
          </aside>
        </div>
      </main>
    </div>
  );
}

function DefaultVerticalPills() {
  const items = [
    { id: "pop-section", label: "유동인구" },
    { id: "store-section", label: "점포" },
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  function go(id: string, idx: number) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveIndex(idx);
    }
  }

  return (
    <nav aria-label="섹션 내비게이션" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <ul className="flex flex-col">
        {items.map((it, idx) => {
          const isActive = idx === activeIndex;
          return (
            <li key={it.id} className={idx !== 0 ? "mt-3" : undefined}>
              <button
                type="button"
                onClick={() => go(it.id, idx)}
                aria-current={isActive ? "page" : undefined}
                className={
                  "w-full text-left text-base leading-6 " +
                  (isActive ? "text-[#3288FF] font-semibold" : "text-gray-400 hover:text-gray-600")
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

function DefaultPopulationCardSkeleton({
  sectionTitle,
}: {
  sectionTitle?: React.ReactNode;
}) {
  const [mode, setMode] = useState<"time" | "dow">("time");
  return (
    <div>
      {/* Section title */}
      <h3 className="text-[18px] font-semibold text-gray-900">{sectionTitle ?? "요약"}</h3>

      {/* Segmented control (static, full width) */}
      <div className="mt-4 w-full rounded-xl bg-gray-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode("time")}
            aria-pressed={mode === "time"}
            className={
              `w-full justify-center rounded-xl px-4 py-4 text-sm font-medium shadow-sm ` +
              (mode === "time" ? "bg-white text-[#3288FF]" : "text-gray-500")
            }
          >
            시간대 추이
          </button>
          <button
            type="button"
            onClick={() => setMode("dow")}
            aria-pressed={mode === "dow"}
            className={
              `w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "dow" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            요일 추이
          </button>
        </div>
      </div>

      {/* Highlight statement */}
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-gray-900">
        <span className="font-medium">강조 문장</span>
        <span className="ml-1 font-bold text-rose-500">
          {mode === "time" ? "시간대 하이라이트" : "요일 하이라이트"}
        </span>
      </div>

      {/* Caption (right-aligned) */}
      <div className="mt-1 text-right text-xs text-gray-400">최근 28일</div>

      {/* Blue metric line */}
      <div className="mt-4 text-[15px] font-semibold text-[#3288FF]">지표 요약 문구</div>

      {/* Two-column summary */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
        <div className="grid grid-cols-2">
          <div className="border-b border-gray-200 bg-[#EAF3FF] px-4 py-4 text-center text-sm font-semibold text-gray-800">요약 A</div>
          <div className="border-b border-l border-gray-200 bg-[#EAF3FF] px-4 py-4 text-center text-sm font-semibold text-gray-800">요약 B</div>
          <div className="px-4 py-4 text-center text-gray-800">내용 A</div>
          <div className="border-l border-gray-200 px-4 py-4 text-center text-gray-800">내용 B</div>
        </div>
      </div>
    </div>
  );
}
