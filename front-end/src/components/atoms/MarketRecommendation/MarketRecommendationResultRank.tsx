'use client';

import React from 'react';
import { RecommendationItem } from '@/types/recommendation';

interface MarketRecommendationResultRankProps {
  results?: RecommendationItem[];
  onItemClick?: (item: RecommendationItem) => void;
}

const RankCard: React.FC<RecommendationItem & { onClick?: () => void }> = ({ ranking, areaName, totalScore, onClick }) => {
  const getRankGradient = (ranking: number) => {
    switch (ranking) {
      case 1:
        return 'bg-gradient-to-r from-orange-600 to-orange-300 text-white';
      case 2:
        return 'bg-gradient-to-r from-blue-600 to-blue-300 text-white';
      case 3:
        return 'bg-gradient-to-r from-green-600 to-green-300 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-300 text-white';
    }
  };

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

  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${getRankGradient(ranking)}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        {/* 왼쪽: 큰 순위 번호 */}
        <div className="flex items-center">
          <span className="text-3xl font-bold">{ranking}</span>
        </div>
        
        {/* 중앙: 상권명 */}
        <div className="flex-1 text-center">
          <div className="text-base font-semibold truncate">{areaName}</div>
        </div>
        
        {/* 오른쪽: 점수 */}
        <div className="text-right">
          <div className="text-xl font-bold">{formatScore(totalScore)}/100</div>
        </div>
      </div>
    </div>
  );
};

const MarketRecommendationResultRank: React.FC<MarketRecommendationResultRankProps> = ({ 
  results = [],
  onItemClick
}) => {
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
            onClick={() => {
              console.log('RankCard onClick triggered:', result);
              onItemClick?.(result);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketRecommendationResultRank;
