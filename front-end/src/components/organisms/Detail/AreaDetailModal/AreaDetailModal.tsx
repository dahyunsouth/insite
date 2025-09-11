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
        // align modal to the right side of the viewport
        "fixed inset-0 z-50 flex items-start justify-end"
      }
    >
      {/* backdrop
      <div className="absolute inset-0 bg-black/30" onClick={onClose} /> */}

      {/* modal */}
      <div className="relative z-10 w-[calc(75vw-1rem)] mt-2 mr-2" onClick={(e) => e.stopPropagation()}>
        <AreaDetailModalTemplate title={title} subtitle={subtitle} onClose={onClose} />
      </div>
    </div>,
    document.body
  );
}
