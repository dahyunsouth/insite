"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
};

export default function SalesInfoModal({ isOpen, onClose, position }: Props) {
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
          <h3 className="text-lg font-semibold text-gray-900">매출이란?</h3>
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
            <strong>매출</strong>은 특정 상권에서 발생한 실제 거래 금액과 거래 건수를 의미합니다.
          </p>
          <p className="mb-3">
            이 데이터는 시간대별, 요일별로 분석되어 상권의 매출 패턴을 파악하는 데 중요한 지표가 됩니다.
          </p>
          <p className="mb-3">
            매출이 높은 시간대나 요일을 파악하면, 상권의 활성도와 잠재 고객의 구매 패턴을 이해할 수 있습니다.
          </p>
          <p>
            매출 데이터는 상권의 실제 성과를 나타내는 핵심 지표로, 사업 계획 수립에 중요한 참고 자료가 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
