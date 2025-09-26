'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { RecommendationItem, RecommendationResponse } from '@/types/recommendation';
import DetailContent from '../Detail/DetailContent';
import TradeAreaRawData from '@/data/TradeAreaValue.json';
import { tmToWgs84 } from '@/utils/coordinateTransform';
import { getAiSummary } from '@/lib/api/aiSummary';
import { AiSummaryData } from '@/types/aiSummary';
import { useFavorites } from '@/contexts/FavoritesContext';
import { authManager } from '@/utils/auth';

interface MarketRecommendationResultContentProps {
  result: RecommendationResponse;
  onBack?: () => void;
  selectedItem: RecommendationItem | null;
  onSelectedItemChange?: (selectedItem: RecommendationItem | null) => void;
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

const MarketRecommendationResultContent: React.FC<MarketRecommendationResultContentProps> = ({ 
  result, 
  onBack, 
  selectedItem, 
  onSelectedItemChange,
  onAddToComparison,
  onRemoveFromComparison,
  isInComparison
}) => {
  const [populationType, setPopulationType] = useState<"유동" | "직장" | "상주">("유동");
  const [isSaved, setIsSaved] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detailContainerRef = useRef<HTMLDivElement>(null);
  
  // FavoritesContext 사용
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  // AI 요약 정보 상태 관리 (캐싱을 위해 Map 사용)
  const [aiSummaryCache, setAiSummaryCache] = useState<Map<string, AiSummaryData>>(new Map());
  
  const topThree = result.items.slice(0, 3);
  const secondaryItems = topThree.slice(1).filter((item): item is RecommendationItem => Boolean(item));

  const handleSave = async () => {
    console.log('💾 [MarketRecommendationResultContent] handleSave 함수 시작');
    
    if (!selectedItem) {
      console.error('💾 [MarketRecommendationResultContent] 선택된 상권이 없음');
      setError('상권 정보를 찾을 수 없습니다.');
      return;
    }

    const trdarCode = selectedItem.trdarCode || getTradeAreaCodeByName(selectedItem.areaName);
    if (!trdarCode) {
      console.error('💾 [MarketRecommendationResultContent] 상권 코드가 없음');
      setError('상권 코드를 찾을 수 없습니다.');
      return;
    }

    // 로그인 확인
    const isLoggedIn = authManager.isLoggedIn();
    console.log('💾 [MarketRecommendationResultContent] 로그인 상태:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('💾 [MarketRecommendationResultContent] 로그인 필요');
      setError('로그인이 필요합니다.');
      return;
    }

    console.log('💾 [MarketRecommendationResultContent] 로딩 시작');
    setIsLoading(true);
    setError(null);

    try {
      const currentIsSaved = isFavorite(parseInt(trdarCode));
      const currentTrdarCdNm = selectedItem.areaName || '상권';
      
      console.log('💾 [MarketRecommendationResultContent] 현재 저장 상태:', currentIsSaved);
      console.log('💾 [MarketRecommendationResultContent] 상권명:', currentTrdarCdNm);
      
      if (currentIsSaved) {
        // 저장 해제
        console.log('💾 [MarketRecommendationResultContent] 저장 해제 API 호출 시작');
        await removeFavorite(parseInt(trdarCode));
        setIsSaved(false);
        console.log('✅ [MarketRecommendationResultContent] 상권 저장 해제 성공:', trdarCode);
      } else {
        // 저장
        console.log('💾 [MarketRecommendationResultContent] 저장 API 호출 시작');
        await addFavorite(parseInt(trdarCode), currentTrdarCdNm);
        setIsSaved(true);
        console.log('✅ [MarketRecommendationResultContent] 상권 저장 성공:', trdarCode);
      }
      setError(null); // 성공 시 에러 메시지 제거
    } catch (error) {
      console.error('❌ [MarketRecommendationResultContent] 상권 저장/해제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '저장 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      console.log('💾 [MarketRecommendationResultContent] 로딩 종료');
      setIsLoading(false);
    }
  };

  const handleCompare = () => {
    console.log('🔍 [MarketRecommendationResultContent] handleCompare 함수 시작');
    
    if (!selectedItem) {
      console.error('🔍 [MarketRecommendationResultContent] 선택된 상권이 없음');
      return;
    }

    const trdarCode = selectedItem.trdarCode || getTradeAreaCodeByName(selectedItem.areaName);
    if (!trdarCode) {
      console.error('🔍 [MarketRecommendationResultContent] 상권 코드가 없음');
      return;
    }

    const currentTrdarCdNm = selectedItem.areaName || '상권';
    const isCurrentlyInComparison = isInComparison ? isInComparison(trdarCode) : false;
    
    console.log('🔍 [MarketRecommendationResultContent] 현재 비교 상태:', isCurrentlyInComparison);
    console.log('🔍 [MarketRecommendationResultContent] 상권 코드:', trdarCode);
    console.log('🔍 [MarketRecommendationResultContent] 상권명:', currentTrdarCdNm);
    
    if (isCurrentlyInComparison) {
      // 비교함에서 제거
      console.log('🔍 [MarketRecommendationResultContent] 비교함에서 제거');
      onRemoveFromComparison?.(trdarCode);
      setIsComparing(false);
    } else {
      // 비교함에 추가
      console.log('🔍 [MarketRecommendationResultContent] 비교함에 추가');
      onAddToComparison?.(trdarCode, currentTrdarCdNm);
      setIsComparing(true);
    }
  };

  // selectedItem이 변경될 때 스크롤을 맨 위로 이동하고 상태 초기화
  useLayoutEffect(() => {
    if (selectedItem && detailContainerRef.current) {
      // 상세페이지 컨테이너의 스크롤을 맨 위로 이동
      detailContainerRef.current.scrollTop = 0;
    }
    
    // 선택된 아이템이 변경되면 에러 상태 초기화
    setError(null);
    
    // 저장 상태와 비교 상태를 실제 상태에서 확인
    if (selectedItem) {
      const trdarCode = selectedItem.trdarCode || getTradeAreaCodeByName(selectedItem.areaName);
      if (trdarCode) {
        // 저장 상태 확인
        const currentIsSaved = isFavorite(parseInt(trdarCode));
        setIsSaved(currentIsSaved);
        console.log('💾 [MarketRecommendationResultContent] 저장 상태 업데이트:', currentIsSaved, trdarCode);
        
        // 비교 상태 확인
        const currentIsComparing = isInComparison ? isInComparison(trdarCode) : false;
        setIsComparing(currentIsComparing);
        console.log('🔍 [MarketRecommendationResultContent] 비교 상태 업데이트:', currentIsComparing, trdarCode);
      } else {
        setIsSaved(false);
        setIsComparing(false);
      }
    } else {
      setIsSaved(false);
      setIsComparing(false);
    }
  }, [selectedItem, isFavorite, isInComparison]);

  // 1등 아이템의 AI 요약 정보 가져오기
  useEffect(() => {
    if (topThree[0]) {
      fetchAiSummaryForItem(topThree[0]);
    }
  }, [topThree[0]?.trdarCode, topThree[0]?.areaName]);

  // 2등, 3등 아이템들의 AI 요약 정보 가져오기
  useEffect(() => {
    secondaryItems.forEach(item => {
      fetchAiSummaryForItem(item);
    });
  }, [secondaryItems.map(item => `${item.trdarCode}-${item.areaName}`).join(',')]);

  const handleCardClick = (item: RecommendationItem) => {
    onSelectedItemChange?.(item);
  };

  // AI 요약 정보를 가져오는 함수
  const fetchAiSummaryForItem = async (item: RecommendationItem) => {
    const trdarCode = item.trdarCode || getTradeAreaCodeByName(item.areaName || '');
    if (!trdarCode) return;

    // 이미 캐시에 있으면 로딩하지 않음
    if (aiSummaryCache.has(trdarCode)) return;

    // 로딩 상태 설정
    setAiSummaryCache(prev => new Map(prev.set(trdarCode, {
      summary: '',
      features: [],
      isLoading: true,
      error: null
    })));

    try {
      const aiData = await getAiSummary(trdarCode);
      setAiSummaryCache(prev => new Map(prev.set(trdarCode, {
        summary: aiData?.summary || '',
        features: aiData?.features || [],
        isLoading: false,
        error: null
      })));
    } catch (error) {
      setAiSummaryCache(prev => new Map(prev.set(trdarCode, {
        summary: '',
        features: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'AI 요약 정보를 가져올 수 없습니다.'
      })));
    }
  };

  // 1등
  const renderPrimaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    
    // AI 요약 정보 가져오기
    const trdarCode = item.trdarCode || getTradeAreaCodeByName(item.areaName || '');
    const aiData = trdarCode ? aiSummaryCache.get(trdarCode) : null;
    
    // Fallback 텍스트 (API 실패 시 사용)
    const getFallbackContent = (areaName: string) => ({
      summary: `${areaName}은 대중교통 접근성이 뛰어나고 주변에 대학가와 사무실 밀집지역이 인접해 있어 다양한 고객층을 확보할 수 있습니다. 주말과 평일 모두 활발한 유동인구를 보유하고 있어 안정적인 매출을 기대할 수 있으며, 주변 주거지역의 고소득층 거주자들이 많아 높은 소비력을 가진 고객들을 확보할 수 있습니다.`,
      features: [
        `${areaName} 주변의 인구밀도가 높아 상권 활성도가 우수합니다`,
        `교통 접근성이 좋아 유동인구가 많고, 상권의 지속적인 성장이 기대됩니다`,
        `다양한 업종의 상점들이 입지하고 있어 경쟁이 치열하지만, 동시에 상권의 다양성을 제공합니다`,
        `주변 인프라가 잘 갖춰져 있어 상권의 안정성이 높습니다`
      ]
    });
    
    const fallbackContent = getFallbackContent(item.areaName || '');
    const displaySummary = aiData?.summary || fallbackContent.summary;
    const displayFeatures = aiData?.features.length ? aiData.features : fallbackContent.features;

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
           <div className='mt-3 space-y-3'>
             <div className=''>
               <div className='text-md font-semibold text-gray-700 mb-2'>💡 AI 추천 이유</div>
               <div className='text-sm text-gray-600 leading-relaxed text-justify'>
                 {aiData?.isLoading ? (
                   <div className="flex items-center gap-2">
                     <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                     <span>AI 분석 중...</span>
                   </div>
                 ) : aiData?.error ? (
                   <span className="text-red-500">AI 분석 정보를 불러올 수 없습니다.</span>
                 ) : (
                   displaySummary
                 )}
               </div>
             </div>
             <div>
               <div className='text-sm font-semibold text-gray-700 mb-1'>📋 주요 특징</div>
               <div className='text-xs text-gray-600 leading-relaxed'>
                 {aiData?.isLoading ? (
                   <div className="flex items-center gap-2">
                     <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                     <span>특징 분석 중...</span>
                   </div>
                 ) : aiData?.error ? (
                   <span className="text-red-500">특징 정보를 불러올 수 없습니다.</span>
                 ) : (
                   <ul className="space-y-0.1">
                     {displayFeatures.map((feature, index) => (
                       <li key={index} className="flex items-start gap-2">
                         <span className="text-gray-400 mt-1">•</span>
                         <span>{feature}</span>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>
    );
  };

  // 2등, 3등
  const renderSecondaryCard = (item: RecommendationItem) => {
    const style = getStyle(item.ranking);
    const totalScoreLabel = '종합 추천 점수';
    
    // AI 요약 정보 가져오기
    const trdarCode = item.trdarCode || getTradeAreaCodeByName(item.areaName || '');
    const aiData = trdarCode ? aiSummaryCache.get(trdarCode) : null;
    
    // Fallback 텍스트 (API 실패 시 사용)
    const getFallbackContent = (ranking: number, areaName: string) => {
      if (ranking === 2) {
        return {
          summary: `${areaName}은 젊은 직장인들이 선호하는 카페와 맛집이 밀집된 지역으로, 유동인구가 높고 소비력이 우수합니다. 특히 주말에는 많은 방문객들이 찾아와 활발한 상권 활동을 보입니다.`,
          features: [
            `${areaName}은 젊은 직장인들이 선호하는 카페와 맛집이 밀집된 지역`,
            `유동인구가 높고 소비력이 우수`,
            `주말에는 많은 방문객들이 찾아와 활발한 상권 활동`
          ]
        };
      } else if (ranking === 3) {
        return {
          summary: `${areaName}은 주거밀도가 높고 생활밀착형 상권이 발달되어 있어 안정적인 고객층을 확보할 수 있습니다. 주민들의 충성도가 높아 지속적인 매출이 기대됩니다.`,
          features: [
            `${areaName}은 주거밀도가 높고 생활밀착형 상권이 발달`,
            `안정적인 고객층을 확보할 수 있음`,
            `주민들의 충성도가 높아 지속적인 매출 기대`
          ]
        };
      }
      return {
        summary: `${areaName}은 다양한 상업시설과 인프라가 잘 갖춰진 지역으로, 상권의 특성과 잠재력을 분석한 결과를 제공합니다.`,
        features: [
          `주변 인구밀도가 높아 상권 활성도가 우수`,
          `교통 접근성이 좋아 유동인구가 많음`,
          `다양한 업종의 상점들이 입지하고 있어 경쟁이 치열`
        ]
      };
    };
    
    const fallbackContent = getFallbackContent(item.ranking, item.areaName || '');
    const displaySummary = aiData?.summary || fallbackContent.summary;
    const displayFeatures = aiData?.features.length ? aiData.features : fallbackContent.features;

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
          <div className='mt-3'>
            <div className=''>
              <div className='text-md font-semibold text-gray-700 mb-2'>💡 AI 추천 이유</div>
              <div className='text-sm text-gray-600 leading-relaxed text-justify'>
                {aiData?.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    <span>AI 분석 중...</span>
                  </div>
                ) : aiData?.error ? (
                  <span className="text-red-500">AI 분석 정보를 불러올 수 없습니다.</span>
                ) : (
                  displaySummary
                )}
              </div>
            </div>
          </div>
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
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (topThree.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center text-gray-500'>
        <div className='text-center'>
          <div className='text-8xl mb-4'>😢</div>
          <div>해당 조건에 맞는 상권이 없습니다.</div>
          <div>다시 설정해주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1 gap-4 h-full'>
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
