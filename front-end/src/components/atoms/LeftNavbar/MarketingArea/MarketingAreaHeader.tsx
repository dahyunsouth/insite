"use client";

import React from "react";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type MarketingAreaHeaderProps = {
  className?: string;
  onHelpClick?: () => void;
  onClose?: () => void;
};

export default function MarketingAreaHeader({ className, onHelpClick, onClose }: MarketingAreaHeaderProps) {
  return (
    <div className={"w-full flex items-center justify-between " + (className ?? "") }>
      <div className="flex items-center gap-2">
        <span className="text-black font-bold">상권</span>
        <button
          type="button"
          aria-label="도움말"
          onClick={onHelpClick}
          className="group inline-flex items-center justify-center"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 stroke-gray-400 group-hover:stroke-gray-500" />
        </button>
      </div>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}


