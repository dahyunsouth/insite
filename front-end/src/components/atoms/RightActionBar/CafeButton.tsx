'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CafeButtonProps {
  isActive?: boolean;
  onToggle?: (categoryId: string) => void;
  className?: string;
}

const CafeButton: React.FC<CafeButtonProps> = ({ 
  isActive = false,
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
      onToggle('CE7'); // 카페 카테고리 ID
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
      {/* 커피 아이콘 버튼 */}
      <button
        onClick={handleClick}
        className={`
          w-12 h-12 bg-white rounded-2xl shadow-md hover:shadow-lg
          flex items-center justify-center
          text-gray-600
          transition-all duration-300 ease-in-out
          hover:bg-gray-100
          active:bg-gray-200
          focus:outline-none
          active:scale-[0.98]
          cursor-pointer
          ${isActive ? 'bg-[#3288FF] text-white hover:bg-[#3288FF]' : ''}
          ${className}
        `}
      >
        {/* 커피 컵 SVG 아이콘 */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-gray-600 group-hover:hidden"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      </button>

      {/* 확장된 텍스트 */}
      <div
        className={`
          absolute right-0 top-0
          bg-gray-500 rounded-2xl shadow-lg
          overflow-hidden
          h-12 cursor-pointer
          flex h-full items-center justify-center text-white
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-20 opacity-100' : 'w-12 opacity-0'}
        `}
        onClick={handleClick}
      >
        카페보기
      </div>
    </div>
  );
};

export default CafeButton;
