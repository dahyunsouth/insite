"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
};

export default function MarketChangeIndicatorInfoModal({ isOpen, onClose, position }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Modal */}
      <div 
        className="absolute z-10 w-[640px] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">상권 변화 지표란?</h3>
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
          <p className="mb-4">
            <strong>상권 변화 지표</strong>는 상권의 변화를 생존한 사업체의 평균 영업기간과 폐업한 사업체의 평균 영업기간을 기준으로 4개 등급으로 나눈 지표입니다.
          </p>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-red-700">다이나믹</h4>
                <strong className="text-red-600 text-xs">도시재생 및 신규 개발 상권으로 창업 진출입시 세심한 주의가 필요한 상권</strong>
              </div>
              <p className="text-black text-xs">
                상권의 사업체 평균 영업기간이 서울시 생존/폐업 사업체 평균보다 모두 낮은 상권
              </p>
            </div>

            <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-700">상권확장</h4>
                <strong className="text-green-600 text-xs">신규 업체가 경쟁력을 가지는 상권</strong>
              </div>
              <p className="text-black text-xs">
                상권의 사업체 평균 영업기간이 서울시 생존 사업체 평균보다 낮고, 폐업 사업체 평균보다 높은 상권
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-700">상권축소</h4>
                <strong className="text-blue-600 text-xs">기존 업체가 경쟁력을 가지는 상권</strong>
              </div>
              <p className="text-black text-xs">
                상권의 사업체 평균 영업기간이 서울시 생존 사업체 평균보다 높고, 폐업 사업체 평균보다 낮은 상권
              </p>
            </div>

            <div className="p-3 rounded-lg bg-orange-50 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-orange-700">정체</h4>
                <strong className="text-orange-600 text-xs">창업 진출입시 세심한 주의가 필요한 상권</strong>
              </div>
              <p className="text-black text-xs">
                상권의 사업체 평균 영업기간이 서울시 생존/폐업 사업체 평균보다 모두 높은 상권
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
