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
    const normalizedName = districtName || null;
    if (districtId !== selectedDistrict.id || normalizedName !== selectedDistrict.name) {
      setSelections(null);
    }
    setSelectedDistrict({
      id: districtId,
      name: normalizedName,
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
      setCurrentStep(1);
      setShowMap(true);
    } else {
      setCurrentStep(2);
      setShowMap(false);
    }
  };

  return (
    <div className="fixed inset-0 p-4 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full h-full flex flex-col">
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

        <div className="flex flex-row flex-1 gap-4 min-h-0">
          <div className="w-1/4 flex-shrink-0">
            <LeftMarketRecommendationBar
              selectedDistrict={selectedDistrict.name}
              selections={selections}
              onReset={handleReset}
              onStepClick={handleStepClick}
            />
          </div>
          <div className="w-3/4 bg-white rounded-2xl border border-gray-300 p-6 min-h-0 flex flex-col">
            {showMap ? (
              <MarketRecommendationMap
                onDistrictSelect={handleDistrictSelect}
                onNextStep={handleNextStep}
                initialSelectedDistrict={selectedDistrict.id}
              />
            ) : (
              <MarketTypeStore
                selectedDistrictName={selectedDistrict.name}
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
