'use client';

import React, { useState } from 'react';
import MarketType from '@/components/atoms/MarketRecommendation/MarketType';
import StoreSize from '@/components/atoms/MarketRecommendation/StoreSize';
import StoreRentalFee from '@/components/atoms/MarketRecommendation/StoreRentalFee';
import MarketRecommendationLoding from './MarketRecommendationLoding';
import MarketRecommendationResult from './MarketRecommendationResult';

interface MarketTypeStoreProps {
  onSelectionsChange?: (selections: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  }) => void;
  onBack?: () => void;
  initialSelections?: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  } | null;
}

const MarketTypeStore: React.FC<MarketTypeStoreProps> = ({ onSelectionsChange, onBack, initialSelections }) => {
  const [marketType, setMarketType] = useState<string | null>(initialSelections?.marketType || null);
  const [storeSize, setStoreSize] = useState<string | null>(initialSelections?.storeSize || null);
  const [minFee, setMinFee] = useState<number>(initialSelections?.minFee || 0);
  const [maxFee, setMaxFee] = useState<number>(initialSelections?.maxFee || 100000000);
  const [hasInteracted, setHasInteracted] = useState<boolean>(initialSelections?.hasInteracted || false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  // 모든 필드가 입력되었는지 확인
  const isAllFieldsFilled = marketType && storeSize && hasInteracted;

  const handleMarketTypeChange = (type: string | null) => {
    setMarketType(type);
    onSelectionsChange?.({
      marketType: type,
      storeSize,
      minFee,
      maxFee,
      hasInteracted
    });
  };

  const handleStoreSizeChange = (size: string | null) => {
    setStoreSize(size);
    onSelectionsChange?.({
      marketType,
      storeSize: size,
      minFee,
      maxFee,
      hasInteracted
    });
  };

  const handleFeeChange = (newMinFee: number, newMaxFee: number) => {
    setMinFee(newMinFee);
    setMaxFee(newMaxFee);
    setHasInteracted(true);
    onSelectionsChange?.({
      marketType,
      storeSize,
      minFee: newMinFee,
      maxFee: newMaxFee,
      hasInteracted: true
    });
  };

  const handleRecommendationClick = () => {
    setIsLoading(true);
    // 실제 추천 로직이 구현되면 여기서 API 호출 등을 처리
    // 현재는 3초 후 로딩 종료 (테스트용)
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
    }, 3000);
  };

  const handleBackFromResult = () => {
    setShowResult(false);
  };

  // 로딩 중일 때는 로딩 컴포넌트 표시
  if (isLoading) {
    return <MarketRecommendationLoding />;
  }

  // 결과 페이지 표시
  if (showResult) {
    return <MarketRecommendationResult onBack={handleBackFromResult} />;
  }

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex flex-col space-y-6">
        <MarketType 
          onMarketTypeChange={handleMarketTypeChange} 
          initialValue={marketType}
        />
        <StoreSize 
          onSizeChange={handleStoreSizeChange} 
          initialValue={storeSize}
        />
        <StoreRentalFee 
          onFeeChange={handleFeeChange}
          initialMinFee={minFee}
          initialMaxFee={maxFee}
          initialHasInteracted={hasInteracted}
        />
      </div>
      <div className="flex gap-2">
        {/* 뒤로가기 */}
        <button
          onClick={onBack}
          className='cursor-pointer rounded-xl bg-gray-300 px-4 py-3
          text-gray-400 hover:text-white hover:bg-gray-400 transition-colors'>
          &lt;
        </button>
        <button 
          onClick={handleRecommendationClick}
          className={`w-full py-3 px-4 rounded-lg transition-colors ${
            isAllFieldsFilled
              ? 'bg-[#3288FF] text-white cursor-pointer hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!isAllFieldsFilled}
        >
          추천 결과 보기
        </button>
      </div>
    </div>
  );
};

export default MarketTypeStore;
