'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import LoginButton from '@/components/atoms/RightActionBar/LoginButton';
import MarketRecoButton from '@/components/atoms/Common/Button/MarketRecoButton';
import MarketRecoModal from '@/components/atoms/Common/Button/MarketRecoModal';

interface LoginBarProps {
  className?: string;                 // 포지션/여백 커스터마이즈
  onLoginSuccess?: () => void;        // 로그인 성공 콜백
  onLogoutSuccess?: () => void;       // 로그아웃 성공 콜백
  onCompareClick?: () => void;        // 상권비교 모달 열기 콜백
  onProfileClick?: () => void;        // 프로필 클릭 콜백
  onSavedAreasClick?: () => void;     // 저장된 상권 클릭 콜백
  isLoggedIn?: boolean;               // 로그인 상태
}

const LoginBar: React.FC<LoginBarProps> = ({
  className = '',
  onLoginSuccess,
  onLogoutSuccess,
  onCompareClick,
  onProfileClick,
  onSavedAreasClick,
  isLoggedIn = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarketRecoModalOpen, setIsMarketRecoModalOpen] = useState(false);

  const handleLoginClick = () => {
    // 다른 모달이 열려있다면 닫기
    if (isMarketRecoModalOpen) {
      setIsMarketRecoModalOpen(false);
    }
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

  const handleMarketRecoModalOpen = () => {
    // 다른 모달이 열려있다면 닫기
    if (isModalOpen) {
      setIsModalOpen(false);
    }
    
    setIsMarketRecoModalOpen(true);
  };

  const handleMarketRecoModalClose = () => {
    setIsMarketRecoModalOpen(false);
  };

  const handleUserModalOpen = () => {
    // MarketRecoModal이 열려있다면 닫기
    if (isMarketRecoModalOpen) {
      setIsMarketRecoModalOpen(false);
    }
  };

  return (
    <div
      className={`
        fixed right-4 top-4 z-[210]
        flex flex-row gap-2 items-center
        ${className}
      `}
    >
      {/* 상권추천 버튼 */}
      <MarketRecoButton 
        onClick={handleMarketRecoModalOpen}
      />
      
      {/* 로그인 버튼 (정사각형 → 호버 시 확장) */}
      <LoginButton 
        onLoginClick={handleLoginClick}
        onLogoutSuccess={handleLogoutSuccess}
        onUserModalOpen={handleUserModalOpen}
        onProfileClick={onProfileClick}
        onSavedAreasClick={onSavedAreasClick}
        isLoggedIn={isLoggedIn}
      />

      {/* 상권추천 모달 */}
      <MarketRecoModal
        isVisible={isMarketRecoModalOpen}
        onClose={handleMarketRecoModalClose}
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLoginClick}
        onCompareClick={onCompareClick}
      />

      {/* 로그인 모달 렌더링 */}
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
    <div className="fixed inset-0 z-[510] flex items-center justify-center py-8">
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

export default LoginBar;
