'use client';

import React from 'react';

const MarketRecommendationLoding: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      {/* 로딩 스피너 - 원이 회전하는 애니메이션 */}
      <div className="relative mb-8">
        <div className="w-20 h-20 relative">
          {/* 회전하는 원 */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="w-full h-full border-6 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-6 border-transparent border-t-blue-500 border-r-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 로딩 텍스트 */}
      <div className="text-center">
        <p className="text-lg text-gray-700 mb-2">
          선택한 기준들을 바탕으로
        </p>
        <p className="text-lg text-gray-700">
          적합한 상권을 추천중입니다
        </p>
      </div>

    </div>
  );
};

export default MarketRecommendationLoding;
