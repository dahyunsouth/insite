'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Z_INDEX } from '@/config/zIndex';

// CSS 애니메이션 스타일
const gradientAnimationStyle = `
  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

interface MarketRecoModalProps {
  isVisible: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onCompareClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const MarketRecoModal: React.FC<MarketRecoModalProps> = ({
  isVisible,
  onClose,
  isLoggedIn = false,
  onLoginClick,
  onCompareClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 외부 클릭 시 모달 닫기
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        timeoutId = setTimeout(() => {
          onClose();
        }, 100);
      }
    };

    if (isVisible) {
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

  const handleMarketRecommendation = () => {
    if (isLoggedIn) {
      router.push('/marketrecommendation');
    } else {
      onLoginClick?.();
    }
    onClose();
  };

  const handleMarketComparison = () => {
    if (isLoggedIn) {
      // 로그인된 상태: 상권비교 모달 열기
      onCompareClick?.();
    } else {
      // 로그인되지 않은 상태: 로그인 모달 열기
      onLoginClick?.();
    }
    onClose();
  };

  return createPortal(
    <>
      <style>{gradientAnimationStyle}</style>
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{
          position: 'fixed',
          top: '80px',
          right: '60px',
          minWidth: '160px',
          maxWidth: '200px',
          zIndex: Z_INDEX.NAV_DROPDOWN,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
      {/* 메뉴 버튼들 */}
      <div className="py-2">
            {/* 상권 추천 버튼 */}
            <button
              onClick={handleMarketRecommendation}
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span className="font-medium">상권 추천</span>
            </button>

            {/* 상권 비교 버튼 */}
            <button
              onClick={handleMarketComparison}
              className="cursor-pointer w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
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
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <span className="font-medium">상권 비교</span>
            </button>
          </div>
      </div>
    </>,
    document.body
  );
};

export default MarketRecoModal;
