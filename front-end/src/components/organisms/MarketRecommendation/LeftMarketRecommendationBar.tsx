'use client';

import React, { useState, useEffect } from 'react';

interface FilterItem {
  id: number;
  title: string;
  value?: string;
  isSelected?: boolean;
}

interface LeftMarketRecommendationBarProps {
  selectedDistrict?: string | null;
}

const LeftMarketRecommendationBar: React.FC<LeftMarketRecommendationBarProps> = ({ selectedDistrict }) => {
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
    },
    {
      id: 3,
      title: '규모',
      value: '창업 규모를 선택하세요.',
      isSelected: false
    },
    {
      id: 4,
      title: '임대료',
      value: '창업 임대료 영역을 선택하세요.',
      isSelected: false
    }
  ]);

  const handleFilterClick = (id: number) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === id 
          ? { ...filter, isSelected: !filter.isSelected }
          : filter
      )
    );
  };

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

  const handleReset = () => {
    setFilters(prev => 
      prev.map(filter => ({
        ...filter,
        isSelected: false,
        value: filter.id === 1 
          ? '선호 행정구를 선택하세요.'
          : filter.id === 2
          ? '선호 상권 유형을 선택하세요.'
          : filter.id === 3
          ? '창업 규모를 선택하세요.'
          : '창업 임대료 영역을 선택하세요.'
      }))
    );
  };

  return (
    <div
    className="
    flex flex-col justify-between
    h-full bg-white rounded-2xl shadow-sm
    border border-gray-200 p-6 max-w-sm mx-auto">
      {/* 필터 목록 */}
      <div className="space-y-4 mb-6">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="flex items-start cursor-pointer"
            onClick={() => handleFilterClick(filter.id)}
          >
            {/* 번호 원 */}
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-sm font-medium">
                {filter.id}
              </span>
            </div>
            
            {/* 텍스트 영역 */}
            <div className="flex-1 m-0.5">
              <div className="font-semibold text-gray-900 text-base">
                {filter.title}
              </div>
              {filter.value && (
                <div className="text-gray-500 text-sm mt-1">
                  {filter.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 초기화 버튼 */}
      <button
        onClick={handleReset}
        className="cursor-pointer w-full bg-gray-300 hover:bg-gray-400 text-gray-500 hover:text-white py-3 px-4 rounded-lg transition-colors duration-200"
      >
        초기화
      </button>
    </div>
  );
};

export default LeftMarketRecommendationBar;
