"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import AreaDetailModalTemplate from "@/components/templates/Detail/AreaDetailModalTemplate";

type AreaDetailModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

/**
 * Organism: AreaDetailModal
 * - Renders portal + backdrop + ESC close
 * - Uses the Detail template for visuals (container/header/section-nav)
 */
export default function AreaDetailModal({ open, onClose, title, subtitle }: AreaDetailModalProps) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={
        // start from the same Y as the navbar (top: 0); keep right safe padding for the right rail
        "fixed inset-0 z-50 flex items-start justify-center pb-10 pl-4 pr-[112px]"
      }
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* modal */}
      <div className="relative z-10 mx-auto" onClick={(e) => e.stopPropagation()}>
        <AreaDetailModalTemplate title={title} subtitle={subtitle} onClose={onClose} />
      </div>
    </div>,
    document.body
  );
}
