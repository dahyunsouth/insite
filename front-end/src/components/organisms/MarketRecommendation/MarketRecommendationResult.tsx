'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RecommendationItem, RecommendationResponse } from '@/types/recommendation';
import { API_ENDPOINTS } from '@/config/api';
import { authManager } from '@/utils/auth';
import MarketRecommendationResultContent from './MarketRecommendationResultContent';

interface MarketRecommendationResultProps {
  result: RecommendationResponse;
  selectedItem?: RecommendationItem | null;
  onItemSelect?: (item: RecommendationItem | null) => void;
  onBack?: () => void;
  onAddToComparison?: (trdarCd: string, trdarCdNm: string) => void;
  onRemoveFromComparison?: (trdarCd: string) => void;
  isInComparison?: (trdarCd: string) => boolean;
}

type RankStyle = {
  container: string;
  badgeBackground: string;
  badgeSrc: string;
  accent: string;
  scoreBadgeBorder: string;
  scoreBadgeText: string;
};

const RANK_STYLES: Record<number, RankStyle> = {
  1: {
    container: 'border border-orange-500 bg-orange-50',
    badgeBackground: 'bg-orange-500',
    badgeSrc: '/badges/ic_first.svg',
    accent: 'border-orange-500',
    scoreBadgeBorder: 'border-orange-600',
    scoreBadgeText: 'text-orange-700',
  },
  2: {
    container: 'border border-blue-500 bg-blue-50',
    badgeBackground: 'bg-blue-500',
    badgeSrc: '/badges/ic_second.svg',
    accent: 'border-blue-500',
    scoreBadgeBorder: 'border-blue-600',
    scoreBadgeText: 'text-blue-700',
  },
  3: {
    container: 'border border-green-500 bg-green-50',
    badgeBackground: 'bg-green-700',
    badgeSrc: '/badges/ic_third.svg',
    accent: 'border-green-500',
    scoreBadgeBorder: 'border-green-600',
    scoreBadgeText: 'text-green-700',
  },
};

const DEFAULT_STYLE: RankStyle = {
  container: 'border border-gray-300 bg-white',
  badgeBackground: 'bg-gray-500',
  badgeSrc: '/badges/ic_first.svg',
  accent: 'border-gray-300',
  scoreBadgeBorder: 'border-gray-300',
  scoreBadgeText: 'text-gray-700',
};

const getStyle = (ranking: number): RankStyle => RANK_STYLES[ranking] || DEFAULT_STYLE;

const MarketRecommendationResult: React.FC<MarketRecommendationResultProps> = ({ 
  result, 
  selectedItem: propSelectedItem, 
  onItemSelect, 
  onBack,
  onAddToComparison,
  onRemoveFromComparison,
  isInComparison
}) => {
  const [nickname, setNickname] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(propSelectedItem || null);
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_INFO, {
          method: 'GET',
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.result?.nickname) {
            setNickname(userData.result.nickname);
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    };
    
    fetchUserInfo();
  }, []);

  // propSelectedItem이 변경될 때 내부 상태 동기화
  useEffect(() => {
    setSelectedItem(propSelectedItem || null);
  }, [propSelectedItem]);
  
  const handleSelectedItemChange = (item: RecommendationItem | null) => {
    setSelectedItem(item);
    onItemSelect?.(item);
  };

  const handleBackClick = () => {
    if (selectedItem) {
      // 상세 정보에서 추천 결과로 돌아가기
      setSelectedItem(null);
      onItemSelect?.(null);
    } else {
      // 추천 결과에서 이전 단계로 돌아가기
      onBack?.();
    }
  };

  const headerTitle = selectedItem 
    ? `${selectedItem.areaName}`
    : nickname 
      ? `👏🏻 ${nickname}님을 위한 맞춤 추천 결과` 
      : '맞춤 추천 결과';

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex items-center justify-between py-4 mb-4 border-b'>
        <button
          onClick={handleBackClick}
          className='cursor-pointer rounded-xl px-4 py-2 text-gray-400 hover:text-gray-800'
        >
          &lt;
        </button>
        <div className='flex items-center gap-4 pb-2'>
          {selectedItem && (
            <div className='flex items-center'>
              <Image 
                src={getStyle(selectedItem.ranking).badgeSrc} 
                alt={`ranking-badge-${selectedItem.ranking}`} 
                width={40} 
                height={40} 
                className='w-10 h-10 object-contain' 
              />
            </div>
          )}
          <h1 className='text-3xl font-semibold text-gray-800'>{headerTitle}</h1>
        </div>
        <div className='w-16' />
      </div>
      <MarketRecommendationResultContent 
        result={result} 
        onBack={onBack} 
        selectedItem={selectedItem}
        onSelectedItemChange={handleSelectedItemChange}
        onAddToComparison={onAddToComparison}
        onRemoveFromComparison={onRemoveFromComparison}
        isInComparison={isInComparison}
      />
    </div>
  );
};

export default MarketRecommendationResult;
