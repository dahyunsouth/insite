'use client';

import React from 'react';

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
  const handleClick = () => {
    if (onToggle) {
      onToggle('CE7'); // 카페 카테고리 ID
    }
  };

  return (
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
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-white text-gray-600 hover:bg-gray-100'
        }
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
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
    </button>
  );
};

export default CafeButton;
