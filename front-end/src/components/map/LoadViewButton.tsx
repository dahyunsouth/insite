'use client';

import React, { useState, useRef, useEffect } from 'react';

interface LoadViewButtonProps {
  isActive?: boolean;
  isMinimized?: boolean;
  onToggle?: (action: boolean | 'minimize' | 'restore') => void;
  className?: string;
}

const LoadViewButton: React.FC<LoadViewButtonProps> = ({ 
  isActive = false,
  isMinimized = false,
  onToggle,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  };

  const handleClick = () => {
    if (onToggle) {
      if (!isActive) {
        // 로드뷰가 비활성화 상태 → 활성화
        onToggle(true);
      } else {
        // 로드뷰가 활성화 상태 → 완전히 꺼기
        onToggle(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CCTV 아이콘 버튼 */}
      <button
        onClick={handleClick}
        className={`
          w-12 h-12 rounded-2xl shadow-md hover:shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          focus:outline-none
          active:scale-[0.98]
          cursor-pointer
          ${isActive 
            ? 'bg-[#3288FF] text-white hover:bg-[#3288FF]' 
            : 'bg-white text-gray-600 hover:bg-gray-100'
          }
          ${className}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            role="img" 
            aria-label="Camera Icon">
        
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
        </svg>

      </button>

      {/* 확장된 텍스트 */}
      <div
        className={`
          absolute right-0 top-0
          bg-[#3288FF] rounded-2xl shadow-lg
          overflow-hidden
          h-12 cursor-pointer
          flex h-full items-center justify-center text-white
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-20 opacity-100' : 'w-12 opacity-0'}
        `}
        onClick={handleClick}
      >
        로드뷰
      </div>
    </div>
  );
};

export default LoadViewButton;
