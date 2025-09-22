"use client";

import React from "react";

type ComparisonTrayProps = {
  className?: string;
  comparisonItems: { trdarCd: string; trdarCdNm: string }[];
  onRemoveItem?: (trdarCd: string) => void;
  onCompareClick?: (area1: { trdarCd: string; trdarCdNm: string }, area2: { trdarCd: string; trdarCdNm: string }) => void;
};

export default function ComparisonTray({ className, comparisonItems, onRemoveItem, onCompareClick }: ComparisonTrayProps) {

  return (
    <div className={`fixed bottom-6 z-[60] px-4 max-w-[calc(100vw-2rem)] ${className || ""}`} 
         style={{ left: 'calc(25vw + 0.5rem + 37.5vw - 50%)' }}>
      <div className="bg-gray-800 rounded-3xl px-6 py-4 shadow-lg flex items-center gap-4">
        {/* 담긴 상권 카드들 - 2개 슬롯 고정 */}
        <div className="flex items-center gap-4">
          {/* 첫 번째 상권 슬롯 */}
          <div className="relative">
            {comparisonItems[0] ? (
              <>
                <div className="bg-white rounded-2xl p-3 min-w-[120px] shadow-md">
                  <div className="text-sm font-medium text-gray-900">
                    {comparisonItems[0].trdarCdNm}
                  </div>
                </div>
                {/* X 버튼 - 비교함에서 제거 */}
                <button 
                  onClick={() => onRemoveItem?.(comparisonItems[0].trdarCd)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-700 transition-colors"
                  title="비교함에서 제거"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="bg-gray-200 rounded-2xl p-3 min-w-[120px] shadow-md border-2 border-dashed border-gray-300">
                <div className="text-sm font-medium text-gray-400 text-center">
                  상권 추가
                </div>
              </div>
            )}
          </div>

          {/* 두 번째 상권 슬롯 */}
          <div className="relative">
            {comparisonItems[1] ? (
              <>
                <div className="bg-white rounded-2xl p-3 min-w-[120px] shadow-md">
                  <div className="text-sm font-medium text-gray-900">
                    {comparisonItems[1].trdarCdNm}
                  </div>
                </div>
                {/* X 버튼 - 비교함에서 제거 */}
                <button 
                  onClick={() => onRemoveItem?.(comparisonItems[1].trdarCd)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-700 transition-colors"
                  title="비교함에서 제거"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="bg-gray-200 rounded-2xl p-3 min-w-[120px] shadow-md border-2 border-dashed border-gray-300">
                <div className="text-sm font-medium text-gray-400 text-center">
                  상권 추가
                </div>
              </div>
            )}
          </div>
        </div>

        
        {/* 비교하기 버튼 */}
        <button 
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-colors ml-auto"
          onClick={() => {
            if (comparisonItems.length >= 1) {
              // 첫 번째 상권은 있으면 사용, 없으면 빈 객체
              const firstArea = comparisonItems[0] || { trdarCd: "", trdarCdNm: "" };
              // 두 번째 상권은 있으면 사용, 없으면 빈 객체
              const secondArea = comparisonItems[1] || { trdarCd: "", trdarCdNm: "" };
              onCompareClick?.(firstArea, secondArea);
            }
          }}
        >
          비교하기
        </button>
      </div>
    </div>
  );
}
