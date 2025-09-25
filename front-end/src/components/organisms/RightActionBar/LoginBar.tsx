'use client';

import React, { useState, useEffect } from 'react';
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
  onSavedAreasClick?: () => void;     // 상권 보관함 열기 콜백
  isLoggedIn?: boolean;               // 로그인 상태
}

const LoginBar: React.FC<LoginBarProps> = ({
  className = '',
  onLoginSuccess,
  onLogoutSuccess,
  onCompareClick,
  onProfileClick,
  isLoggedIn = false,
  onSavedAreasClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarketRecoModalOpen, setIsMarketRecoModalOpen] = useState(false);
  const [isMarketRecoPinned, setIsMarketRecoPinned] = useState(false); // 클릭 고정 상태
  const [isMarketRecoHover, setIsMarketRecoHover] = useState(false);   // 버튼/모달 hover 상태

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
    // 클릭 시 핀 토글
    setIsMarketRecoPinned((prev) => {
      const nextPinned = !prev;
      if (!nextPinned) {
        // 핀 해제 시 hover 여부에 따라 닫기
        if (!isMarketRecoHover) {
          setIsMarketRecoModalOpen(false);
        }
      } else {
        setIsMarketRecoModalOpen(true);
      }
      return nextPinned;
    });
  };

  const handleMarketRecoModalClose = () => {
    setIsMarketRecoPinned(false);
    setIsMarketRecoModalOpen(false);
  };

  // 버튼 또는 모달 hover 진입
  const handleRecoHoverEnter = () => {
    setIsMarketRecoHover(true);
    setIsMarketRecoModalOpen(true);
  };

  // 버튼 또는 모달 hover 이탈
  const handleRecoHoverLeave = () => {
    setIsMarketRecoHover(false);
    if (!isMarketRecoPinned) {
      setIsMarketRecoModalOpen(false);
    }
  };

  const handleUserModalOpen = () => {
    // MarketRecoModal이 열려있다면 닫기
    if (isMarketRecoModalOpen) {
      setIsMarketRecoModalOpen(false);
    }
  };

  // 전역: 다른 모달이 열릴 때 MarketRecoModal 닫기
  useEffect(() => {
    const handleGlobalClose = () => {
      setIsMarketRecoPinned(false);
      setIsMarketRecoModalOpen(false);
    };
    window.addEventListener('marketreco:close', handleGlobalClose);
    return () => window.removeEventListener('marketreco:close', handleGlobalClose);
  }, []);

  return (
    <div
      className={`
        fixed right-4 top-4 z-[20]
        flex flex-row gap-2 items-center
        ${className}
      `}
    >
      {/* 상권추천 버튼 */}
      <MarketRecoButton 
        onClick={handleMarketRecoModalOpen}
        onMouseEnter={handleRecoHoverEnter}
        onMouseLeave={handleRecoHoverLeave}
        isActive={isMarketRecoModalOpen}
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
        onMouseEnter={handleRecoHoverEnter}
        onMouseLeave={handleRecoHoverLeave}
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
