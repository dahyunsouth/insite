'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import LoginButton from '@/components/atoms/RightActionBar/LoginButton';
import MapTypeToggle from '@/components/atoms/RightActionBar/MapTypeToggle';
import ZoomFuc from '@/components/molecules/ZoomFuc';

interface RightActionBarProps {
  className?: string;                 // 포지션/여백 커스터마이즈
  onLoginClick?: () => void;          // 로그인 버튼 클릭
  onZoomIn?: () => void;              // 줌 인 버튼 클릭
  onZoomOut?: () => void;             // 줌 아웃 버튼 클릭
  onMapTypeChange?: (mapType: 'roadmap' | 'skyview') => void; // 지도 타입 변경
}

const RightActionBar: React.FC<RightActionBarProps> = ({
  className = '',
  onLoginClick,
  onZoomIn,
  onZoomOut,
  onMapTypeChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsModalOpen(true);
    onLoginClick?.();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div
      className={`
        fixed right-4 top-1/2 -translate-y-1/2 z-40
        flex flex-col items-end justify-between
        h-full py-4
        ${className}
      `}
    >
      {/* 로그인 버튼 (정사각형 → 호버 시 확장) */}
      <LoginButton onClick={handleLoginClick} />

      {/* 지도 컨트롤 버튼들 (하단에 세로 정렬) */}
      <div className="flex flex-col space-y-1">
        <MapTypeToggle onMapTypeChange={onMapTypeChange} />
        <ZoomFuc onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>

      {/* 모달 렌더링 */}
      <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

// 모달 컴포넌트를 별도로 분리
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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
        />
      </div>
    </div>,
    document.body
  );
};

export default RightActionBar;
