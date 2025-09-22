"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
};

export default function StoreInfoModal({ isOpen, onClose, position }: Props) {
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
          <h3 className="text-lg font-semibold text-gray-900">점포란?</h3>
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
            <strong>점포</strong>는 특정 상권 내에 위치한 모든 상업시설을 의미합니다.
          </p>
          <p className="mb-3">
            점포 데이터는 상권의 규모와 활성도를 파악하는 중요한 지표로, 유사 업종 점포와 프랜차이즈 점포로 구분하여 분석됩니다.
          </p>
          <p className="mb-3">
            <strong>개업률</strong>과 <strong>폐업률</strong>은 상권의 성장성과 안정성을 나타내는 핵심 지표입니다.
          </p>
          <p>
            이러한 점포 지표들을 통해 상권의 현재 상태와 변화 추이를 파악하여 사업 계획 수립에 활용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
