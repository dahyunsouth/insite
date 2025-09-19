'use client';

import React from 'react';
import Image from 'next/image';
import { RecommendationItem, RecommendationResponse } from '@/types/recommendation';

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
  return numeric.toFixed(2);
};

const ScoreSummary: React.FC<{ item: RecommendationItem }> = ({ item }) => (
  <div className='space-y-1 text-sm text-gray-600'>
    <p>
      지속가능성 {formatScore(item.sustainabilityScore)} · 수익성 {formatScore(item.profitabilityScore)} · 접근성 {formatScore(item.accessibilityScore)}
    </p>
    <p>
      위험도 {formatScore(item.riskScore)} · 경쟁강도 {formatScore(item.competitionScore)}
    </p>
  </div>
);

const MarketRecommendationResult: React.FC<MarketRecommendationResultProps> = ({ result, onBack }) => {
  const topThree = result.items.slice(0, 3);
  const secondaryItems = topThree.slice(1).filter((item): item is RecommendationItem => Boolean(item));
  const areaTypeLabel = result.areaType ? result.areaType + ' 상권' : '상권';
  const headerTitle = (result.district ? result.district + ' ' : '') + areaTypeLabel + ' 추천 결과';

  const renderPrimaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    return (
      <div key={item.ranking} className={'flex flex-1 rounded-xl py-4 px-6 ' + style.container}>
        <div className='flex flex-col gap-4 justify-center items-center flex-1 p-4'>
          <div className='flex items-center justify-center flex-1'>
            <Image src={style.badgeSrc} alt={'ranking-badge-' + item.ranking} width={160} height={160} className='w-full h-full object-contain' />
          </div>
          <div className={'flex justify-between items-center rounded-full text-white px-6 py-2 ' + style.badgeBackground}>
            {totalScoreLabel}
            <span>{formatScore(item.totalScore)}</span>
          </div>
        </div>
        <div className='flex flex-col flex-1 justify-center'>
          <div className={'flex pb-4 mb-4 border-b ' + style.accent}>
            <div className='text-2xl font-bold text-gray-800'>{item.areaName || '정보 없음'}</div>
          </div>
          <ScoreSummary item={item} />
        </div>
      </div>
    );
  };

  const renderSecondaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    return (
      <div key={item.ranking} className={'flex flex-1 rounded-xl py-1 px-6 ' + style.container}>
        <div className='flex flex-col gap-4 justify-center items-center flex-1 p-4'>
          <div className='flex items-center justify-center flex-1'>
            <Image src={style.badgeSrc} alt={'ranking-badge-' + item.ranking} width={160} height={160} className='w-full h-full object-contain' />
          </div>
          <div className={'flex justify-between items-center rounded-full text-white px-6 py-2 ' + style.badgeBackground}>
            {totalScoreLabel}
            <span>{formatScore(item.totalScore)}</span>
          </div>
        </div>
        <div className='flex flex-col flex-1 justify-center'>
          <div className={'flex pb-4 mb-4 border-b ' + style.accent}>
            <div className='text-2xl font-bold text-gray-800'>{item.areaName || '정보 없음'}</div>
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
        {renderPrimaryCard(topThree[0])}
        <div className='flex-1 flex gap-4'>
          {secondaryItems.map((item) => renderSecondaryCard(item))}
        </div>
      </div>
    </div>
  );
};

export default MarketRecommendationResult;
