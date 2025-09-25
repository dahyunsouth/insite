'use client';

import React, { useState } from 'react';
import { RecommendationItem } from '@/types/recommendation';

interface MarketRecommendationResultRankProps {
  results?: RecommendationItem[];
  onItemClick?: (item: RecommendationItem) => void;
}

const RankCard: React.FC<RecommendationItem & { onClick?: () => void; isActive?: boolean }> = ({ ranking, areaName, totalScore, onClick, isActive = false }) => {
  // 기본(비호버) 스타일
  const baseGradient = 'bg-gradient-to-r from-gray-200 to-gray-50';
  // 호버/클릭 시
  const hoverActiveGradient = 'hover:from-blue-500 hover:to-blue-200 active:from-blue-500 active:to-blue-200';
  const baseBorder = 'border border-transparent';
  const hoverActiveBorder = 'hover:border-blue-500 active:border-blue-500';
  const textHoverActive = 'hover:text-white active:text-white';

  const formatScore = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return '-';
    }
    return numeric.toFixed(2);
  };

  const handleClick = () => {
    console.log('RankCard clicked:', { ranking, areaName, totalScore });
    onClick?.();
  };

  const baseClasses = 'p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r border';
  const inactiveClasses = `${baseClasses} from-gray-200 to-gray-50 border-transparent hover:from-blue-500 hover:to-blue-200 hover:border-blue-500 hover:text-white`;
  const activeClasses = `${baseClasses} from-blue-500 to-blue-200 border-blue-500 text-white`;

  return (
    <div 
      className={isActive ? activeClasses : inactiveClasses}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4 justify-between">
        {/* 왼쪽: 큰 순위 번호 */}
        <div className="flex items-center">
          <span className="text-2xl">{ranking}</span>
        </div>
        
        {/* 중앙: 상권명 */}
        <div className="flex-1 text-left">
          <div className="text-base font-semibold">{areaName}</div>
        </div>
        
        {/* 오른쪽: 점수 */}
        <div className="text-right font-normal">
          <span className="text-xl font-bold">{formatScore(totalScore)}</span>
          <span className="text-md">/100</span>
        </div>
      </div>
    </div>
  );
};

const MarketRecommendationResultRank: React.FC<MarketRecommendationResultRankProps> = ({ 
  results = [],
  onItemClick
}) => {
  const [activeRank, setActiveRank] = useState<number | null>(null);
  // 결과가 없으면 빈 상태 표시
  if (!results || results.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">추천 순위</h2>
          <p className="text-sm text-gray-600">Recommendation Rank</p>
        </div>
        <div className="text-center py-8 text-gray-500">
          추천 결과가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">추천 순위</h2>
        <p className="text-sm text-gray-600">Recommendation Rank</p>
      </div>
      
      {/* 순위 카드들 */}
      <div className="space-y-3">
        {results.map((result) => (
          <RankCard
            key={result.ranking}
            {...result}
            isActive={activeRank === result.ranking}
            onClick={() => {
              setActiveRank(result.ranking);
              onItemClick?.(result);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketRecommendationResultRank;
