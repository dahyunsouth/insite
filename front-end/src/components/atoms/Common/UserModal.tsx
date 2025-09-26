'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '@/config/zIndex';
import { useUser } from '@/contexts/UserContext';
import ProfilePics from './ProfilePics';

interface UserModalProps {
  isVisible: boolean;
  onClose: () => void;
  nickname?: string;
  onFavoritesClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isVisible,
  onClose,
  nickname = '사용자',
  onFavoritesClick,
  onLogoutClick,
  onProfileClick
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { userInfo, loading } = useUser();

  // 프로필 이미지 경로 생성 함수
  const getProfileImageSrc = (profile: string | null | undefined) => {
    if (!profile || profile === 'default') {
      return '/profilepics/profile_default.png';
    }
    
    const validProfiles = ['cat', 'dog', 'fox', 'chick', 'panda', 'rabbit'];
    if (validProfiles.includes(profile)) {
      return `/profilepics/profile_${profile}.png`;
    }
    
    return '/profilepics/profile_default.png';
  };

  // 외부 클릭 시 모달 닫기 (지연 적용)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // 100ms 지연 후 모달 닫기
        timeoutId = setTimeout(() => {
          onClose();
        }, 100);
      }
    };

    if (isVisible) {
      // 200ms 후에 외부 클릭 감지 활성화
      timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 200);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);
  
  if (!isVisible) {
    return null;
  }
  

  return createPortal(
    <div
      ref={modalRef}
      className="bg-white rounded-xl border border-gray-200 shadow-lg"
      style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        minWidth: '200px',
        maxWidth: '250px',
        backgroundColor: 'white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        zIndex: Z_INDEX.MODAL_CONTENT, // 모달 콘텐츠 계층
      }}
    >
      {/* 사용자 인사말 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex flex-col items-center space-y-3">
          {/* 프로필 사진 */}
          <div 
            onClick={() => {
              onProfileClick?.();
              onClose();
            }}
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
          >
            <ProfilePics 
              src={getProfileImageSrc(userInfo?.profile)}
              alt={`${userInfo?.nickname || nickname} 프로필`}
              size="md"
            />
          </div>
          {/* 인사말 */}
          <div>
            <div className="text-gray-800 font-semibold text-base leading-tight text-center">
              {loading ? '로딩 중...' : `${userInfo?.nickname || nickname}님`},
            </div>
            <div className="text-sm text-gray-500 font-normal">안녕하세요!</div>
          </div>
        </div>
      </div>

      {/* 메뉴 버튼들 */}
      <div className="py-2">
        {/* 상권 보관함 버튼 */}
        <button
          onClick={() => {
            onFavoritesClick?.();
            onClose();
          }}
          className="cursor-pointer w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-blue-50 hover:text-[#3288FF] transition-colors duration-200"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="font-medium">상권 보관함</span>
        </button>

        {/* 로그아웃 버튼 */}
        <button
          onClick={() => {
            onLogoutClick?.();
            onClose();
          }}
          className="cursor-pointer w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default UserModal;
