"use client";

import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type InfoButtonProps = {
  className?: string;
  onHelpClick?: () => void;
  ariaLabel?: string;
};

export default function InfoButton({ 
  className, 
  onHelpClick, 
  ariaLabel = "도움말" 
}: InfoButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onHelpClick}
      className={"group inline-flex items-center justify-center " + (className ?? "")}
    >
      <QuestionMarkCircleIcon className="h-5 w-5 stroke-gray-400 group-hover:stroke-gray-500" />
    </button>
  );
}
