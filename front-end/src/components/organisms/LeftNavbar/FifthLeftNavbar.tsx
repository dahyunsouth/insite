"use client";

import React from 'react';
import AdstrdMarketList from '@/components/atoms/LeftNavbar/AdstrdMarketList';
import SearchResultList from '@/components/atoms/LeftNavbar/SearchResultList';

interface FifthLeftNavbarProps {
  isVisible: boolean;
  district: string;
  dong: string;
  onClose: () => void;
  showSearchResults?: boolean;
  searchKeyword?: string;
  onSearchClose?: () => void;
}

const FifthLeftNavbar: React.FC<FifthLeftNavbarProps> = ({ 
  isVisible, 
  district, 
  dong, 
  onClose,
  showSearchResults = false,
  searchKeyword = '',
  onSearchClose
}) => {
  // Props 변화 디버깅
  console.log('🔍 FifthLeftNavbar props:', { 
    isVisible, 
    district, 
    dong, 
    showSearchResults, 
    searchKeyword 
  });
  
  if (!isVisible) {
    console.log('❌ FifthLeftNavbar 숨김 상태');
    return null;
  }

  console.log('✅ FifthLeftNavbar 표시 상태');

  return (
    <div className="w-full bg-white flex flex-col items-center h-full max-h-screen">
      <div className='w-full h-full'>
        {/* 검색 결과가 활성화된 경우 SearchResultList 표시, 그렇지 않으면 상권 리스트 표시 */}
        {showSearchResults ? (
          <SearchResultList
            isVisible={showSearchResults}
            searchKeyword={searchKeyword}
            onClose={onSearchClose || onClose}
          />
        ) : (
          <AdstrdMarketList 
            district={district}
            dong={dong}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default FifthLeftNavbar;
