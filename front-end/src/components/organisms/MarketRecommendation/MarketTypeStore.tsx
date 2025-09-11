'use client';

import React, { useState } from 'react';
import MarketType from '@/components/atoms/MarketRecommendation/MarketType';
import StoreSize from '@/components/atoms/MarketRecommendation/StoreSize';
import StoreRentalFee from '@/components/atoms/MarketRecommendation/StoreRentalFee';

interface MarketTypeStoreProps {
  onSelectionsChange?: (selections: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
  }) => void;
  onBack?: () => void;
}

const MarketTypeStore: React.FC<MarketTypeStoreProps> = ({ onSelectionsChange, onBack }) => {
  const [marketType, setMarketType] = useState<string | null>(null);
  const [storeSize, setStoreSize] = useState<string | null>(null);
  const [minFee, setMinFee] = useState<number>(0);
  const [maxFee, setMaxFee] = useState<number>(100000000);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // 모든 필드가 입력되었는지 확인
  const isAllFieldsFilled = marketType && storeSize && hasInteracted;

  const handleMarketTypeChange = (type: string | null) => {
    setMarketType(type);
    onSelectionsChange?.({
      marketType: type,
      storeSize,
      minFee,
      maxFee
    });
  };

  const handleStoreSizeChange = (size: string | null) => {
    setStoreSize(size);
    onSelectionsChange?.({
      marketType,
      storeSize: size,
      minFee,
      maxFee
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
      maxFee: newMaxFee
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex flex-col space-y-6">
        <MarketType onMarketTypeChange={handleMarketTypeChange} />
        <StoreSize onSizeChange={handleStoreSizeChange} />
        <StoreRentalFee onFeeChange={handleFeeChange} />
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
