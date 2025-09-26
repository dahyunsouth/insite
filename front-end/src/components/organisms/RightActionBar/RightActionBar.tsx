'use client';

import React from 'react';
import MapTypeToggle from '@/components/atoms/RightActionBar/MapTypeToggle';
import ZoomFuc from '@/components/molecules/ZoomFuc';
import LoadViewButton from '@/components/map/LoadViewButton';
import CafeButton from '@/components/atoms/RightActionBar/CafeButton';

interface RightActionBarProps {
  className?: string;                 // 포지션/여백 커스터마이즈
  onZoomIn?: () => void;              // 줌 인 버튼 클릭
  onZoomOut?: () => void;             // 줌 아웃 버튼 클릭
  onMapTypeChange?: (mapType: 'roadmap' | 'skyview') => void; // 지도 타입 변경
  onLoadViewToggle?: (action: boolean | 'minimize' | 'restore') => void;      // 로드뷰 토글
  onCafeToggle?: (categoryId: string) => void;  // 카페 토글
  isLoadViewActive?: boolean;         // 로드뷰 활성 상태
  isLoadViewMinimized?: boolean;      // 로드뷰 최소화 상태
  isCafeActive?: boolean;             // 카페 활성 상태
}

const RightActionBar: React.FC<RightActionBarProps> = ({
  className = '',
  onZoomIn,
  onZoomOut,
  onMapTypeChange,
  onLoadViewToggle,
  onCafeToggle,
  isLoadViewActive = false,
  isLoadViewMinimized = false,
  isCafeActive = false,
}) => {
  return (
    <div
      className={`
        fixed right-4 bottom-4 z-[20]
        flex flex-col space-y-1
        ${className}
      `}
    >
      {/* 지도 컨트롤 버튼들 (세로 정렬) */}
      <CafeButton 
        onToggle={onCafeToggle} 
        isActive={isCafeActive}
      />
      <LoadViewButton 
        onToggle={onLoadViewToggle} 
        isActive={isLoadViewActive}
        isMinimized={isLoadViewMinimized}
      />
      <MapTypeToggle onMapTypeChange={onMapTypeChange} />
      <ZoomFuc onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
    </div>
  );
};

export default RightActionBar;
