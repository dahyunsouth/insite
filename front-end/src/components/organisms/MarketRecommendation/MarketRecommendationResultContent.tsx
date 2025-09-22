'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { RecommendationItem, RecommendationResponse } from '@/types/recommendation';
import DetailContent from '../Detail/DetailContent';
import TradeAreaRawData from '@/data/TradeAreaValue.json';
import { tmToWgs84 } from '@/utils/coordinateTransform';

interface MarketRecommendationResultContentProps {
  result: RecommendationResponse;
  onBack?: () => void;
  selectedItem: RecommendationItem | null;
  onSelectedItemChange?: (selectedItem: RecommendationItem | null) => void;
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

// 상권명으로 상권코드를 찾는 함수
const getTradeAreaCodeByName = (areaName: string): string | null => {
  try {
    const tradeArea = TradeAreaRawData.DATA.find((item: any) => 
      item.trdar_cd_nm === areaName || 
      item.trdar_cd_nm === `${areaName} 상권` ||
      areaName === `${item.trdar_cd_nm} 상권`
    );
    return tradeArea?.trdar_cd || null;
  } catch (error) {
    console.warn('Trade area data not found:', error);
    return null;
  }
};

// 상권코드로 좌표를 찾는 함수 (TM 좌표를 위도/경도로 변환)
const getCoordinatesFromTrdarCode = (trdarCode: string): { lat: number; lng: number } | undefined => {
  try {
    const tradeArea = TradeAreaRawData.DATA.find((item: any) => item.trdar_cd === trdarCode);
    if (!tradeArea) {
      console.warn('Trade area not found for code:', trdarCode);
      return undefined;
    }

    // TM 좌표를 위도/경도로 변환 (기존 유틸리티 함수 사용)
    const x = tradeArea.xcnts_value;
    const y = tradeArea.ydnts_value;
    
    const converted = tmToWgs84(x, y);
    console.log('좌표 변환 결과:', { trdarCode, x, y, converted });
    return converted;
  } catch (error) {
    console.warn('좌표 변환 실패:', error);
    return undefined;
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

const ScoreSummary: React.FC<{ item: RecommendationItem; className?: string }> = ({ item, className }) => {
  const style = getStyle(item.ranking);
  const maxBadgeCount = item.ranking === 1 ? 5 : 2;
  const scores = [
    { label: '지속성', score: item.sustainabilityScore },
    { label: '수익성', score: item.profitabilityScore },
    { label: '접근성', score: item.accessibilityScore },
    { label: '위험도', score: item.riskScore },
    { label: '경쟁강도', score: item.competitionScore },
  ]
    .filter(({ score }) => score !== null && score !== undefined && !Number.isNaN(Number(score)))
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, maxBadgeCount);

  const formatScoreForBadge = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return '-';
    }
    return Math.round(numeric).toString();
  };

  return (
    <div className={'flex flex-row gap-2 text-sm text-gray-600 flex-wrap ' + (className || '')}>
      {scores.map(({ label, score }) => (
        <div key={label} className={'border ' + style.scoreBadgeBorder + ' rounded-full px-3 py-1 bg-white whitespace-nowrap'}>
          <div><span className={style.scoreBadgeText + ' font-medium'}>{label}</span> <span className={'font-bold ' + style.scoreBadgeText}>{formatScoreForBadge(score)}점</span></div>
        </div>
      ))}
    </div>
  );
};

const MarketRecommendationResultContent: React.FC<MarketRecommendationResultContentProps> = ({ result, onBack, selectedItem, onSelectedItemChange }) => {
  const [populationType, setPopulationType] = useState<"유동" | "직장" | "상주">("유동");
  const [isSaved, setIsSaved] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const detailContainerRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    console.log('상권 저장:', selectedItem?.areaName);
    setIsSaved(!isSaved);
  };

  const handleCompare = () => {
    console.log('상권 비교:', selectedItem?.areaName);
    setIsComparing(!isComparing);
  };
  
  const topThree = result.items.slice(0, 3);
  const secondaryItems = topThree.slice(1).filter((item): item is RecommendationItem => Boolean(item));

  // selectedItem이 변경될 때 스크롤을 맨 위로 이동하고 상태 초기화
  useLayoutEffect(() => {
    if (selectedItem && detailContainerRef.current) {
      // 상세페이지 컨테이너의 스크롤을 맨 위로 이동
      detailContainerRef.current.scrollTop = 0;
    }
    // 선택된 아이템이 변경되면 저장/비교 상태 초기화
    setIsSaved(false);
    setIsComparing(false);
  }, [selectedItem]);

  const handleCardClick = (item: RecommendationItem) => {
    onSelectedItemChange?.(item);
  };

  // 1등
  const renderPrimaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    
    // AI 프롬프팅 결과 하드코딩 (1위용 - 3배 길이)
    const getAiPromptContent = (ranking: number, areaName: string) => {
      if (ranking === 1) {
        return {
          atmosphere: {
            title: "🏪 상권 분위기",
            content: `${areaName}은 활기찬 도시 상권의 분위기를 자랑합니다. 현대적인 건물들과 전통적인 상점들이 조화롭게 어우러져 독특한 매력을 발산하며, 거리에는 다양한 연령대의 사람들이 오가는 활발한 모습을 볼 수 있습니다. 특히 젊은 층들이 선호하는 트렌디한 카페와 레스토랑들이 즐비한 생동감 넘치는 상권입니다.`
          },
          reason: {
            title: "💡 AI 추천 이유",
            content: `이 지역은 대중교통 접근성이 뛰어나고 주변에 대학가와 사무실 밀집지역이 인접해 있어 다양한 고객층을 확보할 수 있습니다. 주말과 평일 모두 활발한 유동인구를 보유하고 있어 안정적인 매출을 기대할 수 있으며, 주변 주거지역의 고소득층 거주자들이 많아 높은 소비력을 가진 고객들을 확보할 수 있습니다.`
          }
        };
      }
      return null;
    };

    const aiPrompt = getAiPromptContent(item.ranking, item.areaName || '');

    return (
      <div 
        key={item.ranking} 
        className={'flex flex-1 rounded-xl py-4 px-6 h-full cursor-pointer hover:shadow-lg transition-shadow ' + style.container}
        onClick={() => handleCardClick(item)}
      >
        <div className='flex flex-col gap-4 justify-center items-center flex-1 p-4'>
          <div className='flex items-center justify-center flex-1 max-h-32'>
            <Image src={style.badgeSrc} alt={'ranking-badge-' + item.ranking} width={120} height={120} className='w-auto h-full object-contain' />
          </div>
          <div className={'truncate flex justify-between items-center rounded-full text-white px-6 py-2 ' + style.badgeBackground}>
            {totalScoreLabel} &nbsp;
            <span> {formatScore(item.totalScore)}점</span>
          </div>
        </div>
        <div className='flex flex-col flex-2 justify-center'>
          <div className={'flex pb-2 mb-2 border-b ' + style.accent}>
            <div className='text-2xl font-bold text-gray-800'>🎉{item.areaName || '정보 없음'}</div>
          </div>
           <ScoreSummary item={item} />
           {aiPrompt && (
             <div className='mt-3 space-y-3'>
               <div>
                 <div className='text-sm font-semibold text-gray-700 mb-1'>{aiPrompt.atmosphere.title}</div>
                 <div className='text-xs text-gray-600 leading-relaxed text-justify'>{aiPrompt.atmosphere.content}</div>
               </div>
               <div>
                 <div className='text-sm font-semibold text-gray-700 mb-1'>{aiPrompt.reason.title}</div>
                 <div className='text-xs text-gray-600 leading-relaxed text-justify'>{aiPrompt.reason.content}</div>
               </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  // 2등, 3등
  const renderSecondaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    
    // AI 프롬프팅 결과 하드코딩
    const getAiPromptContent = (ranking: number, areaName: string) => {
      if (ranking === 2) {
        return {
          title: "💡 AI 추천 이유",
          content: `${areaName}은 젊은 직장인들이 선호하는 카페와 맛집이 밀집된 지역으로, 유동인구가 높고 소비력이 우수합니다. 특히 주말에는 많은 방문객들이 찾아와 활발한 상권 활동을 보입니다.`
        };
      } else if (ranking === 3) {
        return {
          title: "💡 AI 추천 이유", 
          content: `${areaName}은 주거밀도가 높고 생활밀착형 상권이 발달되어 있어 안정적인 고객층을 확보할 수 있습니다. 주민들의 충성도가 높아 지속적인 매출이 기대됩니다.`
        };
      }
      return null;
    };

    const aiPrompt = getAiPromptContent(item.ranking, item.areaName || '');

    return (
      <div 
        key={item.ranking} 
        className={'flex flex-1 rounded-xl py-1 px-6 h-full cursor-pointer hover:shadow-lg transition-shadow ' + style.container}
        onClick={() => handleCardClick(item)}
      >
        <div className='flex flex-col gap-4 justify-center items-center flex-1 p-4'>
          <div className='flex items-center justify-center flex-1 max-h-24'>
            <Image src={style.badgeSrc} alt={'ranking-badge-' + item.ranking} width={96} height={96} className='w-auto h-full object-contain' />
          </div>
          <div className={'truncate flex justify-between items-center rounded-full text-white px-4 py-2 text-sm ' + style.badgeBackground}>
            {totalScoreLabel} &nbsp;
            <span> {formatScore(item.totalScore)}점</span>
          </div>
        </div>
        <div className='flex flex-col flex-1 justify-center'>
          <div className={'truncate flex pb-2 mb-2 border-b ' + style.accent}>
            <div className='text-xl font-bold text-gray-800'>😀 {item.areaName || '정보 없음'}</div>
          </div>
          <ScoreSummary item={item} />
          {aiPrompt && (
            <div className='mt-3'>
              <div className='text-sm font-semibold text-gray-700 mb-1'>{aiPrompt.title}</div>
              <div className='text-xs text-gray-600 leading-relaxed text-justify'>{aiPrompt.content}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 선택된 아이템이 있으면 상세 정보 표시
  if (selectedItem) {
    // 상권명으로 상권코드 찾기
    const trdarCode = selectedItem.trdarCode || getTradeAreaCodeByName(selectedItem.areaName);
    
    // 좌표 가져오기 (selectedItem에 coordinates가 없으면 trdarCode로 찾기)
    const coordinates = selectedItem.coordinates || (trdarCode ? getCoordinatesFromTrdarCode(trdarCode) : undefined);
    
    console.log('상세페이지 좌표 정보:', { 
      selectedItem: selectedItem.areaName, 
      trdarCode, 
      selectedCoordinates: selectedItem.coordinates,
      foundCoordinates: coordinates 
    });
    
    return (
      <div ref={detailContainerRef} className='flex-1 overflow-y-auto'>
        <DetailContent
          trdarCode={trdarCode}
          populationType={populationType}
          onPopulationTypeChange={setPopulationType}
          areaName={selectedItem.areaName}
          coordinates={coordinates}
          ranking={selectedItem.ranking}
          showActionButtons={true}
          actionButtonsDirection="horizontal"
          onSave={handleSave}
          onCompare={handleCompare}
          isSaved={isSaved}
          isComparing={isComparing}
        />
      </div>
    );
  }

  if (topThree.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center text-gray-500'>
        추천 결과를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1 pt-4 gap-4 h-full'>
      <div className='flex-1'>
        {renderPrimaryCard(topThree[0])}
      </div>
      <div className='flex-1 flex gap-4'>
        {secondaryItems.map((item) => renderSecondaryCard(item))}
      </div>
    </div>
  );
};

export default MarketRecommendationResultContent;
