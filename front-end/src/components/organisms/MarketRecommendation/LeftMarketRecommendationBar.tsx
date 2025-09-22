'use client';

import React, { useState, useEffect } from 'react';
import MarketRecommendationResultRank from '../../atoms/MarketRecommendation/MarketRecommendationResultRank';
import { RecommendationItem } from '@/types/recommendation';

interface FilterItem {
  id: number;
  title: string;
  value?: string;
  isSelected?: boolean;
}

interface LeftMarketRecommendationBarProps {
  selectedDistrict?: string | null;
  selections?: {
    marketType: string | null;
    storeSize: string | null;
    minFee: number;
    maxFee: number;
    hasInteracted: boolean;
  } | null;
  recommendationResults?: RecommendationItem[];
  selectedItem?: RecommendationItem | null;
  onItemSelect?: (item: RecommendationItem | null) => void;
  onReset?: () => void;
  onStepClick?: (step: number) => void;
}

const LeftMarketRecommendationBar: React.FC<LeftMarketRecommendationBarProps> = ({ selectedDistrict, selections, recommendationResults, selectedItem, onItemSelect, onReset, onStepClick }) => {
  const [filters, setFilters] = useState<FilterItem[]>([
    {
      id: 1,
      title: '선호 행정구',
      value: '선호 행정구를 선택하세요.',
      isSelected: true
    },
    {
      id: 2,
      title: '발달/골목 상권',
      value: '선호 상권 유형을 선택하세요.',
      isSelected: false
    }
    // {
    //   id: 3,
    //   title: '규모',
    //   value: '창업 규모를 선택하세요.',
    //   isSelected: false
    // },
    // {
    //   id: 4,
    //   title: '월 임대료',
    //   value: '창업 월 임대료 영역을 선택하세요.',
    //   isSelected: false
    // }
  ]);


  // 선택된 구가 변경될 때 필터 값 업데이트
  useEffect(() => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === 1 
          ? { 
              ...filter, 
              value: selectedDistrict || '선호 행정구를 선택하세요.', 
              isSelected: !!selectedDistrict 
            }
          : filter
      )
    );
  }, [selectedDistrict]);

  // MarketTypeStore에서 선택된 값들이 변경될 때 필터 값 업데이트
  useEffect(() => {
    if (selections) {
      setFilters(prev => 
        prev.map(filter => {
          switch (filter.id) {
            case 2: // 발달/골목 상권
              return {
                ...filter,
                value: selections.marketType || '선호 상권 유형을 선택하세요.',
                isSelected: !!selections.marketType
              };
            // case 3: // 규모
            //   return {
            //     ...filter,
            //     value: selections.storeSize || '창업 규모를 선택하세요.',
            //     isSelected: !!selections.storeSize
            //   };
            // case 4: // 월 임대료
            //   // hasInteracted가 true인 경우에만 업데이트
            //   if (selections.hasInteracted) {
            //     const feeText = `${selections.minFee.toLocaleString()}원 ~ ${selections.maxFee.toLocaleString()}원`;
            //     return {
            //       ...filter,
            //       value: feeText,
            //       isSelected: true
            //     };
            //   }
            //   // hasInteracted가 false면 기존 상태 유지
            //   return filter;
            default:
              return filter;
          }
        })
      );
    }
  }, [selections]);

  const handleStepClick = (step: number) => {
    onStepClick?.(step);
  };

  const handleReset = () => {
    // 부모 컴포넌트의 초기화 함수 호출
    onReset?.();
    
    // 로컬 필터 상태도 초기화
    setFilters(prev => 
      prev.map(filter => ({
        ...filter,
        isSelected: false,
        value: filter.id === 1 
          ? '선호 행정구를 선택하세요.'
          : filter.id === 2
          ? '선호 상권 유형을 선택하세요.'
          : '선호 상권 유형을 선택하세요.'
      }))
    );
  };

  return (
    <div
    className="
    flex flex-col justify-between
    h-full bg-white rounded-2xl shadow-sm
    border border-gray-200 p-6 w-full">
      {/* 필터 목록 */}
      <div className="space-y-4 mb-6">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="flex items-start"
          >
            {/* 번호 원 */}
            <div 
              onClick={() => handleStepClick(filter.id)}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 cursor-pointer transition-colors ${
                filter.isSelected ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
              <span className={`text-base font-medium ${
                filter.isSelected ? 'text-white' : 'text-gray-600'
              }`}>
                {filter.id}
              </span>
            </div>
            
            {/* 텍스트 영역 */}
            <div className="flex-1 m-0.5">
              <div className="font-semibold text-gray-900 text-lg">
                {filter.title}
              </div>
              {filter.value && (
                <div className="text-gray-500 text-base mt-1">
                  {filter.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
      {/* 추천 순위 결과 - 결과가 있을 때만 표시 */}
      {recommendationResults && recommendationResults.length > 0 && (
        <div className="mb-6">
          <MarketRecommendationResultRank 
            results={recommendationResults} 
            onItemClick={onItemSelect}
          />
        </div>
      )}

        {/* 초기화 버튼 */}
        <button
          onClick={handleReset}
          className="cursor-pointer w-full bg-red-100 text-red-700 hover:bg-red-700 hover:text-white py-3 px-4 rounded-lg transition-colors duration-200"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default LeftMarketRecommendationBar;
