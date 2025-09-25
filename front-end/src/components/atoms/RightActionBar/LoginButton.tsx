'use client';

import React, { useState, useRef } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import UserModal from '@/components/atoms/Common/UserModal';

interface LoginButtonProps {
  onLoginClick?: () => void;  // 로그인 모달 열기
  onLogoutSuccess?: () => void;  // 로그아웃 성공 콜백
  onUserModalOpen?: () => void;  // 사용자 모달 열기 콜백
  onProfileClick?: () => void;   // 프로필 클릭 콜백
  onSavedAreasClick?: () => void;  // 저장된 상권 클릭 콜백
  className?: string;
  isLoggedIn?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  onLoginClick,
  onLogoutSuccess,
  onUserModalOpen,
  onProfileClick,
  onSavedAreasClick,
  className = '',
  isLoggedIn = false
}) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 로그아웃 API 호출 함수
  const handleLogout = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('로그아웃 시도 중...');
      // eslint-disable-next-line no-console
      console.log('로그아웃 요청 URL:', API_ENDPOINTS.LOGOUT);
      
      // localStorage에서 accessToken 가져오기
      const authToken = localStorage.getItem('authToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // accessToken이 있으면 Authorization 헤더에 추가
      if (authToken) {
        // 토큰이 이미 "Bearer "로 시작하는지 확인
        const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
        headers['Authorization'] = token;
        // eslint-disable-next-line no-console
        console.log('Authorization 헤더 추가됨:', token);
        // eslint-disable-next-line no-console
        console.log('원본 authToken:', authToken);
      } else {
        // eslint-disable-next-line no-console
        console.log('authToken이 없습니다');
        // eslint-disable-next-line no-console
        console.log('localStorage 내용:', localStorage.getItem('authToken'));
      }
      
      const response = await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers,
        credentials: 'include', // 쿠키 포함
      });

      // eslint-disable-next-line no-console
      console.log('로그아웃 응답 상태:', response.status);
      // eslint-disable-next-line no-console
      console.log('로그아웃 응답 헤더:', Object.fromEntries(response.headers.entries()));

      const responseData = await response.json();
      // eslint-disable-next-line no-console
      console.log('로그아웃 응답:', responseData);

      if (response.ok && responseData.isSuccess) {
        // 로그아웃 성공
        localStorage.removeItem('authToken'); // 로컬 스토리지에서 토큰 제거
        // eslint-disable-next-line no-console
        console.log('로그아웃 성공');
        onLogoutSuccess?.(); // 상위 컴포넌트에 로그아웃 성공 알림
      } else {
        // 로그아웃 실패 (토큰 만료 등) - 프론트엔드에서 로그아웃 처리
        // eslint-disable-next-line no-console
        console.warn('서버 로그아웃 실패, 클라이언트에서 로그아웃 처리:', responseData.message);
        localStorage.removeItem('authToken'); // 로컬 스토리지에서 토큰 제거
        onLogoutSuccess?.(); // 상위 컴포넌트에 로그아웃 성공 알림
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃 성공 핸들러는 현재 미사용으로 제거

  // 사용자 모달 열기 핸들러
  const handleUserModalOpen = () => {
    onUserModalOpen?.(); // 다른 모달들을 닫기 위한 콜백 호출
    setIsUserModalOpen(true);
  };

  // 사용자 모달 닫기 핸들러
  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
  };

  // 즐겨찾기 클릭 핸들러
  const handleFavoritesClick = () => {
    setIsUserModalOpen(false);
    onSavedAreasClick?.(); // 저장된 상권 사이드바 열기
  };

  // 버튼 클릭 핸들러
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      onLoginClick?.();
    } else {
      // 이미 모달이 열려있으면 닫기, 닫혀있으면 열기 (토글 기능)
      if (isUserModalOpen) {
        handleUserModalClose();
      } else {
        handleUserModalOpen();
      }
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={isLoggedIn ? "사용자 메뉴" : "로그인"}
        onClick={handleClick}
        className={`
          inline-flex items-center justify-center
          w-12 h-12
          rounded-2xl
          bg-white
          shadow-md hover:shadow-lg
          text-gray-700 font-medium text-sm
          focus:outline-none
          active:scale-[0.98] transition-all duration-300 ease-in-out
          ${!isLoggedIn 
            ? 'hover:bg-[#3288FF] hover:text-white hover:w-20' 
            : 'hover:bg-gray-50'
          }
          overflow-hidden
          group
          cursor-pointer
          ${className}
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
      {/* 사용자 아이콘 (기본 상태) */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`text-gray-600 ${!isLoggedIn ? 'group-hover:hidden' : ''}`}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      
      {/* 로그인 텍스트 (호버 상태, 로그인 상태가 아닐 때만) */}
      {!isLoggedIn && (
        <span className="hidden group-hover:block text-white font-medium text-sm whitespace-nowrap">
          로그인
        </span>
      )}
    </button>

    {/* 사용자 모달 */}
    <UserModal
      isVisible={isUserModalOpen}
      onClose={handleUserModalClose}
      nickname="사용자"
      onFavoritesClick={handleFavoritesClick}
      onLogoutClick={handleLogout}
      onProfileClick={onProfileClick}
    />
    
    </>
  );
};

export default LoginButton;
