"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import InfoButton from "../../Common/Button/InfoButton";

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
        <InfoButton onHelpClick={onHelpClick} />
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


