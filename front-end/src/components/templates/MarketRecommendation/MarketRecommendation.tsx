'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarketRecommendationMap from '@/components/atoms/MarketRecommendation/MarketRecommendationMap';
import LeftMarketRecommendationBar from '@/components/organisms/MarketRecommendation/LeftMarketRecommendationBar';
import MarketTypeStore from '@/components/organisms/MarketRecommendation/MarketTypeStore';

interface MarketRecommendationProps {
  onClose: () => void;
}

export default function MarketRecommendation({ onClose }: MarketRecommendationProps) {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [selections, setSelections] = useState<{
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  } | null>(null);

  const handleBackToHome = () => {
    onClose();
    router.push('/');
  };

  const handleDistrictSelect = (districtId: string | null, districtName: string) => {
    setSelectedDistrict({
      id: districtId,
      name: districtName || null
    });
  };

  const handleNextStep = () => {
    setCurrentStep(2);
    setShowMap(false);
  };

  const handleSelectionsChange = (newSelections: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  }) => {
    setSelections(newSelections);
  };

  const handleReset = () => {
    setSelectedDistrict({ id: null, name: null });
    setSelections(null);
    setCurrentStep(1);
    setShowMap(true);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setShowMap(true);
  };

  const handleStepClick = (step: number) => {
    if (step === 1) {
      // 원 1 클릭 시 지도로 이동
      setCurrentStep(1);
      setShowMap(true);
    } else {
      // 원 2, 3, 4 클릭 시 MarketTypeStore로 이동
      setCurrentStep(2);
      setShowMap(false);
    }
  };

  return (
    <div className="fixed inset-0 p-4 z-50 flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      
      {/* 모달 콘텐츠 */}
      <div className="w-full h-full flex flex-col">
        {/* 상권추천 버튼 */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleBackToHome}
            className="cursor-pointer focus:outline-none transition-transform hover:scale-105"
          >
            <img 
              src="/MarketRecommendationButton.svg" 
              alt="상권 추천" 
              className="w-150px h-60px"
            />
          </button>
        </div>
        
        {/* 상권 추천 콘텐츠 - 남은 공간을 모두 차지 */}
        <div className="flex flex-row flex-1 gap-4 min-h-0">
          {/* 우측 영역 */}
          <div className='w-1/4 flex-shrink-0'>
            <LeftMarketRecommendationBar 
              selectedDistrict={selectedDistrict.name}
              selections={selections}
              onReset={handleReset}
              onStepClick={handleStepClick}
            />
          </div>
          {/* 좌측 영역 */}
          <div
          className='w-3/4 bg-white rounded-2xl border border-gray-300 p-6 min-h-0 flex flex-col'>
            {showMap ? (
              <MarketRecommendationMap 
                onDistrictSelect={handleDistrictSelect} 
                onNextStep={handleNextStep}
                initialSelectedDistrict={selectedDistrict.id}
              />
            ) : (
              <MarketTypeStore 
                onSelectionsChange={handleSelectionsChange} 
                onBack={handleBack}
                initialSelections={selections}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}