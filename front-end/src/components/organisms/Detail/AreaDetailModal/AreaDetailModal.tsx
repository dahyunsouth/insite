"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AreaDetailModalTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import TradeAreaSelect from "@/components/molecules/Detail/TradeAreaSelect";
import TimeSlotCard from "@/components/molecules/Detail/TimeSlotCard";
import StoreCard from "@/components/molecules/Detail/StoreCard";
import ResidentPopulationCard from "@/components/molecules/Detail/ResidentPopulationCard";
import WorkPopulationCard from "@/components/molecules/Detail/WorkPopulationCard";

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
      const suffix = " 상권 상황";
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
          sectionAside={<DetailAsideNav />}
        >
          <>
            <section id="resident-section" className="scroll-mt-24">
              <ResidentPopulationCard trdarCode={selected?.code ?? null} />
            </section>
            <section id="pop-section" className="scroll-mt-24">
              <TimeSlotCard trdarCode={selected?.code ?? null} />
            </section>
            <section id="work-section" className="scroll-mt-24">
              <WorkPopulationCard trdarCode={selected?.code ?? null} />
            </section>
            <section id="store-section" className="scroll-mt-24">
              <StoreCard trdarCode={selected?.code ?? null} />
            </section>
          </>
        </AreaDetailModalTemplate>
      </div>
    </div>,
    document.body
  );
}

function DetailAsideNav() {
  const items = [
    { id: "resident-section", label: "상주인구" },
    { id: "work-section", label: "직장인구" },
    { id: "pop-section", label: "유동인구" },
    { id: "store-section", label: "점포" },
  ];
  const [activeIndex, setActiveIndex] = React.useState(0);
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
