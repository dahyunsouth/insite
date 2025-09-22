"use client";

import React from "react";

type ComparisonTrayProps = {
  className?: string;
  onCompareClick?: (area1: { trdarCd: string; trdarCdNm: string }, area2: { trdarCd: string; trdarCdNm: string }) => void;
};

export default function ComparisonTray({ className, onCompareClick }: ComparisonTrayProps) {
  // 임의로 상권 2개를 담아놓은 정적 상태
  const comparisonItems = [
    {
      id: "1",
      trdarCd: "3111090",
      trdarCdNm: "강일동주민센터"
    },
    {
      id: "2", 
      trdarCd: "3120220",
      trdarCdNm: "대치역"
    }
  ];

  return (
    <div className={`fixed bottom-6 z-[60] px-4 max-w-[calc(100vw-2rem)] ${className || ""}`} 
         style={{ left: 'calc(25vw + 0.5rem + 37.5vw - 50%)' }}>
      <div className="bg-gray-800 rounded-3xl px-6 py-4 shadow-lg flex items-center gap-4">
        {/* 담긴 상권 카드들 */}
        <div className="flex items-center gap-4">
          {comparisonItems.map((item) => (
            <div key={item.id} className="relative">
              <div className="bg-white rounded-2xl p-3 min-w-[120px] shadow-md">
                <div className="text-sm font-medium text-gray-900">
                  {item.trdarCdNm}
                </div>
              </div>
              {/* X 버튼 (기능 없음) */}
              <button className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-700 transition-colors">
                ×
              </button>
            </div>
          ))}
        </div>

        
        {/* 비교하기 버튼 */}
        <button 
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-colors ml-auto"
          onClick={() => onCompareClick?.(comparisonItems[0], comparisonItems[1])}
        >
          비교하기
        </button>
      </div>
    </div>
  );
}
