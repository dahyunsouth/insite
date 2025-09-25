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
    <div className={`fixed bottom-6 right-20 z-[230] ${className || ""}`}>
      <div className="bg-gray-800 rounded-3xl px-4 py-3 shadow-lg flex items-center gap-3">
        {/* 담긴 상권 카드들 - 2개 슬롯 고정 */}
        <div className="flex items-center gap-2">
          {/* 첫 번째 상권 슬롯 */}
          <div className="relative">
            {comparisonItems[0] ? (
              <>
                <div className="bg-white rounded-xl p-2 min-w-[80px] max-w-[100px] shadow-md">
                  <div className="text-center text-xs font-medium text-gray-900 truncate">
                    {comparisonItems[0].trdarCdNm}
                  </div>
                </div>
                {/* X 버튼 - 비교함에서 제거 */}
                <button 
                  onClick={() => onRemoveItem?.(comparisonItems[0].trdarCd)}
                  className="cursor-pointer absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center text-white text-xs hover:bg-gray-700 transition-colors"
                  title="비교함에서 제거"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="bg-transparent rounded-xl p-2 min-w-[80px] max-w-[100px] h-[32px] border-2 border-dashed border-gray-400 flex items-center justify-center">
              </div>
            )}
          </div>

          {/* 두 번째 상권 슬롯 */}
          <div className="relative">
            {comparisonItems[1] ? (
              <>
                <div className="bg-white rounded-xl p-2 min-w-[80px] max-w-[100px] shadow-md">
                  <div className="text-center text-xs font-medium text-gray-900 truncate">
                    {comparisonItems[1].trdarCdNm}
                  </div>
                </div>
                {/* X 버튼 - 비교함에서 제거 */}
                <button 
                  onClick={() => onRemoveItem?.(comparisonItems[1].trdarCd)}
                  className="cursor-pointer absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center text-white text-xs hover:bg-gray-700 transition-colors"
                  title="비교함에서 제거"
                >
                  ×
                </button>
              </>
            ) : (
              // 비교 상권 추가
              <button
                className="cursor-pointer bg-transparent rounded-xl p-2 min-w-[80px] max-w-[100px] h-[32px] border-2 border-dashed border-gray-400 flex text-white items-center justify-center"
                onClick={() => {
                  if (comparisonItems.length >= 1) {
                    // 첫 번째 상권은 있으면 사용, 없으면 빈 객체
                    const firstArea = comparisonItems[0] || { trdarCd: "", trdarCdNm: "" };
                    // 두 번째 상권은 있으면 사용, 없으면 빈 객체
                    const secondArea = comparisonItems[1] || { trdarCd: "", trdarCdNm: "" };
                    onCompareClick?.(firstArea, secondArea);
                  }
                }}>
                +
              </button>
            )}
          </div>
        </div>

        
        {/* 비교하기 버튼 */}
        <button 
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors ml-auto"
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
