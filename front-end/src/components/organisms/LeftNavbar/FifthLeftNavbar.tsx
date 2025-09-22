"use client";

import React, { useEffect } from 'react';
import AdstrdMarketList from '@/components/atoms/LeftNavbar/AdstrdMarketList';
import SearchResultList from '@/components/atoms/LeftNavbar/SearchResultList';
import { useKakaoMapContext } from '@/components/map/KakaoMap';

interface FifthLeftNavbarProps {
  isVisible: boolean;
  district: string;
  dong: string;
  onClose: () => void;
  showSearchResults?: boolean;
  searchKeyword?: string;
  onSearchClose?: () => void;
  onSearchReset?: () => void;
  onTradeAreaSelect?: (tradeArea: any) => void;
  selectedTradeArea?: any;
}

const FifthLeftNavbar: React.FC<FifthLeftNavbarProps> = ({ 
  isVisible, 
  district, 
  dong, 
  onClose,
  showSearchResults = false,
  searchKeyword = '',
  onSearchClose,
  onSearchReset,
  onTradeAreaSelect,
  selectedTradeArea
}) => {
  const { map } = useKakaoMapContext();
  

  // 검색 결과가 닫힐 때 마커 제거
  useEffect(() => {
    if (!showSearchResults && map) {
      // 지도에서 모든 마커 제거
      try {
        // DOM에서 직접 마커 요소 찾기 및 제거
        const markerElements = document.querySelectorAll('.kakao-maps-marker, [class*="marker"]');
        markerElements.forEach((element) => {
          element.remove();
        });
        
        // 지도 컨테이너 내의 모든 마커 관련 요소 제거
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
          const mapMarkers = mapContainer.querySelectorAll('[class*="marker"], [class*="Marker"]');
          mapMarkers.forEach((element) => {
            element.remove();
          });
        }
        
        // 지도 새로고침
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (map as any).relayout();
        }, 100);
      } catch (error) {
        console.error('마커 제거 중 오류:', error);
      }
    }
  }, [showSearchResults, map]);
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-white flex flex-col items-center h-full max-h-screen">
      <div className='w-full h-full'>
        {/* 검색 결과가 활성화된 경우 SearchResultList 표시, 그렇지 않으면 상권 리스트 표시 */}
        {showSearchResults ? (
          <SearchResultList
            isVisible={showSearchResults}
            searchKeyword={searchKeyword}
            onClose={onSearchClose || onClose}
            onSearchReset={onSearchReset}
          />
        ) : (
          <AdstrdMarketList 
            district={district}
            dong={dong}
            onClose={onClose}
            onTradeAreaSelect={onTradeAreaSelect}
            selectedTradeArea={selectedTradeArea}
          />
        )}
      </div>
    </div>
  );
};

export default FifthLeftNavbar;
