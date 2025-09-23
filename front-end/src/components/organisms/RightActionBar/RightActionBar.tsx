'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import LoginButton from '@/components/atoms/RightActionBar/LoginButton';
import MapTypeToggle from '@/components/atoms/RightActionBar/MapTypeToggle';
import ZoomFuc from '@/components/molecules/ZoomFuc';
import LoadViewButton from '@/components/map/LoadViewButton';
import CafeButton from '@/components/atoms/RightActionBar/CafeButton';
import Image from 'next/image';

interface RightActionBarProps {
  className?: string;                 // 포지션/여백 커스터마이즈
  onLoginSuccess?: () => void;        // 로그인 성공 콜백
  onLogoutSuccess?: () => void;       // 로그아웃 성공 콜백
  onZoomIn?: () => void;              // 줌 인 버튼 클릭
  onZoomOut?: () => void;             // 줌 아웃 버튼 클릭
  onMapTypeChange?: (mapType: 'roadmap' | 'skyview') => void; // 지도 타입 변경
  onLoadViewToggle?: (action: boolean | 'minimize' | 'restore') => void;      // 로드뷰 토글
  onCafeToggle?: (categoryId: string) => void;  // 카페 토글
  isLoggedIn?: boolean;               // 로그인 상태
  isLoadViewActive?: boolean;         // 로드뷰 활성 상태
  isLoadViewMinimized?: boolean;      // 로드뷰 최소화 상태
  isCafeActive?: boolean;             // 카페 활성 상태
}

const RightActionBar: React.FC<RightActionBarProps> = ({
  className = '',
  onLoginSuccess,
  onLogoutSuccess,
  onZoomIn,
  onZoomOut,
  onMapTypeChange,
  onLoadViewToggle,
  onCafeToggle,
  isLoggedIn = false,
  isLoadViewActive = false,
  isLoadViewMinimized = false,
  isCafeActive = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleLogoutSuccess = () => {
    setIsModalOpen(false); // 모달이 열려있다면 닫기
    onLogoutSuccess?.();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
    onLoginSuccess?.();
  };
  return (
    <div
      className={`
        fixed right-4 top-1/2 -translate-y-1/2 z-20
        flex flex-col items-end justify-between
        h-full py-4
        ${className}
      `}
    >
      <div className='flex flex-row gap-2'>
        {/* 상권추천 버튼 */}
        <button 
          onClick={() => {
            if (isLoggedIn) {
              router.push('/marketrecommendation');
            } else {
              setIsModalOpen(true);
            }
          }}
          className="cursor-pointer focus:outline-none transition-transform duration-200 hover:scale-105"
        >
          <img 
            src="/MarketRecommendationButton.svg" 
            alt="상권 추천" 
            className='w-auto h-full'
          />
        </button>
        
        {/* 로그인 버튼 (정사각형 → 호버 시 확장) */}
        <LoginButton 
          onLoginClick={handleLoginClick}
          onLogoutSuccess={handleLogoutSuccess}
          isLoggedIn={isLoggedIn} 
        />
      </div>

      {/* 지도 컨트롤 버튼들 (하단에 세로 정렬) */}
      <div className="flex flex-col space-y-1">
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

      {/* 모달 렌더링 */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

// 모달 컴포넌트를 별도로 분리
const AuthModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onLoginSuccess: () => void;
}> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center py-8">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative z-10">
        <AuthModalWrapper 
          className="relative"
          onClose={onClose}
          onLoginSuccess={onLoginSuccess}
        />
      </div>
    </div>,
    document.body
  );
};

export default RightActionBar;
