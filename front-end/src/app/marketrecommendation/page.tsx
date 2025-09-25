'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MarketRecommendation from '@/components/templates/MarketRecommendation/MarketRecommendation';
import { useComparisonStore } from '@/stores/comparisonStore';
import ComparisonTray from '@/components/organisms/Compare/ComparisonTray';

export default function MarketRecommendationPage() {
  const router = useRouter();
  
  // Zustand store에서 비교함 상태 관리
  const { 
    comparisonTray, 
    addToComparison, 
    removeFromComparison, 
    isInComparison 
  } = useComparisonStore();

  const handleClose = () => {
    router.push('/');
  };

  const handleCompareClick = (area1: { trdarCd: string; trdarCdNm: string }, area2: { trdarCd: string; trdarCdNm: string }) => {
    // 비교 모달로 이동 (HomePage로 이동하여 비교 모달 열기)
    router.push('/?compare=true');
  };

  return (
    <>
      <MarketRecommendation 
        onClose={handleClose}
        onAddToComparison={addToComparison}
        onRemoveFromComparison={removeFromComparison}
        isInComparison={isInComparison}
      />
      
      {/* 비교함 모달 - 상권 추천 모달 위에 표시 */}
      {comparisonTray.length > 0 && (
        <ComparisonTray 
          comparisonItems={comparisonTray}
          onRemoveItem={removeFromComparison}
          onCompareClick={handleCompareClick}
        />
      )}
    </>
  );
}
