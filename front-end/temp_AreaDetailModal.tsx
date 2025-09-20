"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AreaDetailModalTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";
import TradeAreaSelect from "@/components/molecules/Detail/TradeAreaSelect";

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
      // If incoming title follows "{name} ?곴텒 ?꾪솴", swap the name part
      const suffix = " ?곴텒 ?꾪솴";
      if (title && title.includes(suffix)) return `${selected.name}${suffix}`;
      return `${selected.name}${suffix}`;
    }
    return title;
  }, [selected, title]);

  if (!open) return null;

  return createPortal(
    <div
      className={
        // align modal to the right side of the viewport
        "fixed inset-0 z-50 flex items-start justify-end"
      }
    >
      {/* backdrop */}
      {/* <div className="absolute inset-0 bg-black/30" onClick={onClose} /> */}

      {/* modal */}
      <div className="relative z-10 w-[calc(75vw-1rem)] mt-2 mr-2" onClick={(e) => e.stopPropagation()}>
        <AreaDetailModalTemplate
          title={computedTitle}
          subtitle={subtitle}
          onClose={onClose}
          headerRight={
            <TradeAreaSelect
              onChange={(opt) => {
                setSelected(opt);
                onSelectTradeArea?.(opt);
              }}
            />
          }
        />
      </div>
    </div>,
    document.body
  );
}
