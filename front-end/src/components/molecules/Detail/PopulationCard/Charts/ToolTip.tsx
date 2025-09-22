"use client";

import React from "react";

type ToolTipProps = {
  isVisible: boolean;
  position: { x: number; y: number };
  label: string;
  value: string;
};

export default function ToolTip({ isVisible, position, label, value }: ToolTipProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
    >
      <div className="text-center">
        <span className="text-gray-300 text-xs mr-2">{label}:</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  );
}
