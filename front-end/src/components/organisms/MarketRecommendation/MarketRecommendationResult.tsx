'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RecommendationItem, RecommendationResponse } from '@/types/recommendation';
import { API_ENDPOINTS } from '@/config/api';
import { authManager } from '@/utils/auth';

interface MarketRecommendationResultProps {
  result: RecommendationResponse;
  onBack?: () => void;
}

type RankStyle = {
  container: string;
  badgeBackground: string;
  badgeSrc: string;
  accent: string;
};

const RANK_STYLES: Record<number, RankStyle> = {
  1: {
    container: 'border border-orange-500 bg-orange-50',
    badgeBackground: 'bg-orange-500',
    badgeSrc: '/badges/ic_first.svg',
    accent: 'border-orange-500',
  },
  2: {
    container: 'border border-blue-500 bg-blue-50',
    badgeBackground: 'bg-blue-500',
    badgeSrc: '/badges/ic_second.svg',
    accent: 'border-blue-500',
  },
  3: {
    container: 'border border-green-500 bg-green-50',
    badgeBackground: 'bg-green-700',
    badgeSrc: '/badges/ic_third.svg',
    accent: 'border-green-500',
  },
};

const DEFAULT_STYLE: RankStyle = {
  container: 'border border-gray-300 bg-white',
  badgeBackground: 'bg-gray-500',
  badgeSrc: '/badges/ic_first.svg',
  accent: 'border-gray-300',
};

const getStyle = (ranking: number): RankStyle => RANK_STYLES[ranking] || DEFAULT_STYLE;

const formatScore = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '-';
  }
  return Math.round(numeric).toString();
};

const ScoreSummary: React.FC<{ item: RecommendationItem; className?: string }> = ({ item, className }) => {
  // 모든 점수를 배열로 만들고 정렬하여 상위 2개 선택
  const scores = [
    { label: '지속가능성', score: item.sustainabilityScore },
    { label: '수익성', score: item.profitabilityScore },
    { label: '접근성', score: item.accessibilityScore },
    { label: '위험도', score: item.riskScore },
    { label: '경쟁강도', score: item.competitionScore },
  ]
    .filter(({ score }) => score !== null && score !== undefined && !Number.isNaN(Number(score)))
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 2);

  return (
    <div className={`flex flex-row gap-2 text-sm text-gray-600 ${className || ''}`}>
      {scores.map(({ label, score }) => (
        <div key={label} className="border-1 border-orange-600 rounded-full px-3 py-1 bg-white">
          <div><span className="text-orange-700 font-medium">{label}</span> <span className="font-bold text-orange-700">{formatScore(score)}점</span></div>
        </div>
      ))}
    </div>
  );
};

const MarketRecommendationResult: React.FC<MarketRecommendationResultProps> = ({ result, onBack }) => {
  const [nickname, setNickname] = useState<string>('');
  
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
  
  const topThree = result.items.slice(0, 3);
  const secondaryItems = topThree.slice(1).filter((item): item is RecommendationItem => Boolean(item));
  const headerTitle = nickname ? `👏🏻 ${nickname}님을 위한 맞춤 추천 결과` : '맞춤 추천 결과';

  // 1등
  const renderPrimaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    return (
      <div key={item.ranking} className={'flex flex-1 rounded-xl py-4 px-6 h-full ' + style.container}>
        <div className='flex flex-col gap-4 justify-center items-center flex-1 p-4'>
          <div className='flex items-center justify-center flex-1 max-h-32'>
            <Image src={style.badgeSrc} alt={'ranking-badge-' + item.ranking} width={120} height={120} className='w-auto h-full object-contain' />
          </div>
          <div className={'flex justify-between items-center rounded-full text-white px-6 py-2 ' + style.badgeBackground}>
            {totalScoreLabel} &nbsp;
            <span> {formatScore(item.totalScore)}점</span>
          </div>
        </div>
        <div className='flex flex-col flex-2 justify-center'>
          <div className={'flex pb-2 mb-2 border-b ' + style.accent}>
            <div className='text-2xl font-bold text-gray-800'>🎉{item.areaName || '정보 없음'}</div>
          </div>
           <ScoreSummary item={item} />
        </div>
      </div>
    );
  };

  // 2등, 3등
    const renderSecondaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    return (
      <div key={item.ranking} className={'flex flex-1 rounded-xl py-1 px-6 h-full ' + style.container}>
        <div className='flex flex-col gap-4 justify-center items-center flex-1 p-4'>
          <div className='flex items-center justify-center flex-1 max-h-24'>
            <Image src={style.badgeSrc} alt={'ranking-badge-' + item.ranking} width={96} height={96} className='w-auto h-full object-contain' />
          </div>
          <div className={'truncate flex justify-between items-center rounded-full text-white px-6 py-2 ' + style.badgeBackground}>
            {totalScoreLabel} &nbsp;
            <span> {formatScore(item.totalScore)}점</span>
          </div>
        </div>
        <div className='flex flex-col flex-1 justify-center'>
          <div className={'truncate flex pb-1 mb-2 border-b ' + style.accent}>
            <div className='text-lg font-bold text-gray-800'>😀 {item.areaName || '정보 없음'}</div>
          </div>
          <ScoreSummary item={item} />
        </div>
      </div>
    );
  };

  if (topThree.length === 0) {
    return (
      <div className='w-full h-full flex flex-col'>
        <div className='flex items-center justify-between py-4 border-b'>
          <button
            onClick={onBack}
            className='cursor-pointer rounded-xl px-4 py-3 text-gray-400 hover:text-gray-800'
          >
            &lt;
          </button>
          <h1 className='text-3xl font-semibold text-gray-800'>{headerTitle}</h1>
          <div className='w-16' />
        </div>
        <div className='flex-1 flex items-center justify-center text-gray-500'>
          추천 결과를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex items-center justify-between py-4 border-b'>
        <button
          onClick={onBack}
          className='cursor-pointer rounded-xl px-4 py-3 text-gray-400 hover:text-gray-800'
        >
          &lt;
        </button>
        <h1 className='text-3xl font-semibold text-gray-800'>{headerTitle}</h1>
        <div className='w-16' />
      </div>
      <div className='flex flex-col flex-1 pt-4 gap-4 h-full'>
        <div className='flex-1'>
          {renderPrimaryCard(topThree[0])}
        </div>
        <div className='flex-1 flex gap-4'>
          {secondaryItems.map((item) => renderSecondaryCard(item))}
        </div>
      </div>
    </div>
  );
};

export default MarketRecommendationResult;
