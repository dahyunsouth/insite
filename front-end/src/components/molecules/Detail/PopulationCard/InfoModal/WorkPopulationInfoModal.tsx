"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
};

export default function WorkPopulationInfoModal({ isOpen, onClose, position }: Props) {
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
          <h3 className="text-lg font-semibold text-gray-900">직장인구란?</h3>
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
            <strong>직장인구</strong>는 특정 상권에서 일하는 사람들의 수를 의미합니다.
          </p>
          <p className="mb-3">
            이 데이터는 성별, 연령대별로 분석되어 해당 상권의 직장인 특성을 파악하는 데 중요한 지표가 됩니다.
          </p>
          <p>
            직장인구가 많은 상권일수록 점심시간, 퇴근시간 등 특정 시간대에 집중적인 소비가 발생할 가능성이 높습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
