"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
};

export default function FloatingPopulationInfoModal({ isOpen, onClose, position }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Modal */}
      <div 
        className="absolute z-10 w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">유동인구란?</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
            aria-label="닫기"
          >
            <span className="text-sm">×</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="mt-4 text-sm text-gray-700 leading-relaxed">
          <p className="mb-3">
            <strong>유동인구</strong>는 특정 상권을 지나다니는 사람들의 수를 의미합니다.
          </p>
          <p className="mb-3">
            이 데이터는 시간대별, 요일별로 분석되어 상권의 활성도를 파악하는 데 중요한 지표가 됩니다.
          </p>
          <p>
            유동인구가 많은 상권일수록 잠재 고객이 많다는 의미로, 매출 기회가 높다고 볼 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
