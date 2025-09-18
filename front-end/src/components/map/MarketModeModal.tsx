'use client';

import React from 'react';

interface MarketModeModalProps {
  isLoading: boolean;
}

export default function MarketModeModal({ isLoading }: MarketModeModalProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col items-center justify-center space-y-4 bg-black bg-opacity-70 px-8 py-6 rounded-lg">
        {/* 원형 로딩 애니메이션 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-300 border-solid rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-white border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* 로딩 텍스트 */}
        <div className="text-white text-lg font-medium">
          로딩 중입니다.
        </div>
      </div>
    </div>
  );
}
