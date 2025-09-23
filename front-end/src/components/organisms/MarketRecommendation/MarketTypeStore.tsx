'use client';

import React, { useState } from 'react';
import MarketType from '@/components/atoms/MarketRecommendation/MarketType';
import StoreSize from '@/components/atoms/MarketRecommendation/StoreSize';
import StoreRentalFee from '@/components/atoms/MarketRecommendation/StoreRentalFee';
import MarketRecommendationLoding from './MarketRecommendationLoding';
import MarketRecommendationResult from './MarketRecommendationResult';
import { API_ENDPOINTS } from '@/config/api';
import { BaseApiResponse, RecommendationResponse, RecommendationItem } from '@/types/recommendation';

interface MarketTypeStoreProps {
  selectedDistrictName: string | null;
  onSelectionsChange?: (selections: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  }) => void;
  onRecommendationResultsChange?: (results: RecommendationItem[]) => void;
  selectedItem?: RecommendationItem | null;
  onItemSelect?: (item: RecommendationItem | null) => void;
  onBack?: () => void;
  initialSelections?: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  } | null;
  onAddToComparison?: (trdarCd: string, trdarCdNm: string) => void;
  onRemoveFromComparison?: (trdarCd: string) => void;
  isInComparison?: (trdarCd: string) => boolean;
}

const toApiTradeAreaType = (value: string | null) => {
  if (!value) return null;
  if (value.includes('발달')) {
    return '발달';
  }
  if (value.includes('골목')) {
    return '골목';
  }
  return value;
};

const MarketTypeStore: React.FC<MarketTypeStoreProps> = ({
  selectedDistrictName,
  onSelectionsChange,
  onRecommendationResultsChange,
  selectedItem,
  onItemSelect,
  onBack,
  initialSelections,
  onAddToComparison,
  onRemoveFromComparison,
  isInComparison,
}) => {
  const [marketType, setMarketType] = useState<string | null>(initialSelections?.marketType || null);
  const [storeSize, setStoreSize] = useState<string | null>(initialSelections?.storeSize || null);
  const [minFee, setMinFee] = useState<number>(initialSelections?.minFee ?? 0);
  const [maxFee, setMaxFee] = useState<number>(initialSelections?.maxFee ?? 100000000);
  const [hasInteracted, setHasInteracted] = useState<boolean>(initialSelections?.hasInteracted || false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canRequestRecommendation = Boolean(
    selectedDistrictName && marketType
  );

  const submitButtonClass = canRequestRecommendation
    ? 'bg-[#3288FF] text-white cursor-pointer hover:bg-blue-600'
    : 'bg-gray-200 text-gray-400 cursor-not-allowed';

  const handleMarketTypeChange = (type: string | null) => {
    setMarketType(type);
    onSelectionsChange?.({
      marketType: type,
      storeSize,
      minFee,
      maxFee,
      hasInteracted,
    });
  };

  const handleStoreSizeChange = (size: string | null) => {
    setStoreSize(size);
    onSelectionsChange?.({
      marketType,
      storeSize: size,
      minFee,
      maxFee,
      hasInteracted,
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
      hasInteracted: true,
    });
  };

  const handleRecommendationClick = async () => {
    if (!canRequestRecommendation || !selectedDistrictName || !marketType) {
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const searchParams = new URLSearchParams({
      district: selectedDistrictName,
      type: toApiTradeAreaType(marketType) || '',
    });

    try {
      const requestUrl = API_ENDPOINTS.REC_SYS + '?' + searchParams.toString();
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data: BaseApiResponse<RecommendationResponse> = await response.json();
      if (!data.isSuccess || !data.result) {
        throw new Error(data.message || '추천 결과가 존재하지 않습니다.');
      }

      setRecommendation(data.result);
      // 부모 컴포넌트에 추천 결과 전달
      onRecommendationResultsChange?.(data.result.items);
    } catch (error) {
      console.error('Failed to fetch recommendation result:', error);
      setErrorMessage('추천 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromResult = () => {
    setRecommendation(null);
    // 추천 결과 초기화
    onRecommendationResultsChange?.([]);
  };

  if (isLoading) {
    return <MarketRecommendationLoding />;
  }

  if (recommendation) {
    return (
      <MarketRecommendationResult
        result={recommendation}
        selectedItem={selectedItem}
        onItemSelect={onItemSelect}
        onBack={handleBackFromResult}
        onAddToComparison={onAddToComparison}
        onRemoveFromComparison={onRemoveFromComparison}
        isInComparison={isInComparison}
      />
    );
  }

  return (
    <div className='w-full h-full flex flex-col justify-between'>
      <div className='flex flex-col space-y-6'>
        <MarketType
          onMarketTypeChange={handleMarketTypeChange}
          initialValue={marketType}
        />
        {/* <StoreSize
          onSizeChange={handleStoreSizeChange}
          initialValue={storeSize}
        />
        <StoreRentalFee
          onFeeChange={handleFeeChange}
          initialMinFee={minFee}
          initialMaxFee={maxFee}
          initialHasInteracted={hasInteracted}
        /> */}
      </div>
      <div className='flex flex-col gap-3'>
        {errorMessage && (
          <p className='text-sm text-red-500'>{errorMessage}</p>
        )}
        <div className='flex gap-2'>
          <button
            onClick={onBack}
            className='cursor-pointer rounded-xl bg-gray-300 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-400 transition-colors'
          >
            &lt;
          </button>
          <button
            onClick={handleRecommendationClick}
            className={'w-full py-3 px-4 rounded-lg transition-colors ' + submitButtonClass}
            disabled={!canRequestRecommendation}
          >
            추천 결과 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketTypeStore;
