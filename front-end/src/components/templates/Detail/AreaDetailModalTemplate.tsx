"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type AreaDetailModalTemplateProps = {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
  /** Optional custom section-nav content; if omitted, shows a default placeholder chips row */
  sectionNav?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Template: Detail/AreaDetailModalTemplate
 * - Container bg: #F8F9FA
 * - Header bg: #FFFFFF
 * - Section nav bg: #FFFFFF
 * - Only structure and visuals — no portal or keyboard handling here.
 */
export default function AreaDetailModalTemplate({
  title,
  subtitle,
  onClose,
  className,
  sectionNav,
  children,
}: AreaDetailModalTemplateProps) {
  return (
    <div
      className={
        "relative w-[1000px] rounded-3xl border border-black/5 shadow-xl " +
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
        <div className="px-6 py-4">
          <h2 className="text-[20px] font-semibold text-[#3288FF]">{title ?? "강남역 상권 현황"}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {/* Section block: nav + content */}
      <section className="px-4 pb-6">
        {/* Section surface */}
        <div
          className="rounded-[30px] border border-[#D9D9D9] overflow-hidden"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {/* Section nav */}
          <div className="p-[30px]">
            {sectionNav ?? (
              <div className="flex flex-wrap gap-[10px]">
                {["최신 상권 종합 평가", "유동인구", "소비 금액", "대중교통 승하차"].map((t) => (
                  <span key={t} className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section content slot */}
          {children && <div className="px-4 pb-4">{children}</div>}
        </div>
      </section>
    </div>
  );
}
