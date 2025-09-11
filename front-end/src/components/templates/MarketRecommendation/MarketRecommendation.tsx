'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarketRecommendationMap from '@/components/atoms/MarketRecommendation/MarketRecommendationMap';
import LeftMarketRecommendationBar from '@/components/organisms/MarketRecommendation/LeftMarketRecommendationBar';
import MarketRecommendationProgressBar from '@/components/atoms/MarketRecommendation/MarketRecommendationProgressBar';

interface MarketRecommendationProps {
  onClose: () => void;
}

export default function MarketRecommendation({ onClose }: MarketRecommendationProps) {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleBackToHome = () => {
    onClose();
    router.push('/');
  };

  const handleDistrictSelect = (districtId: string | null, districtName: string) => {
    setSelectedDistrict(districtName || null);
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
            <LeftMarketRecommendationBar selectedDistrict={selectedDistrict} />
          </div>
          {/* 좌측 영역 */}
          <div
          className='w-3/4 bg-white rounded-2xl border border-gray-300 p-6 min-h-0 flex flex-col'>
            <MarketRecommendationMap onDistrictSelect={handleDistrictSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}