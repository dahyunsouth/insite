'use client';

import React from 'react';

interface ZoomInButtonProps {
  onClick?: () => void;
  className?: string;
}

const ZoomInButton: React.FC<ZoomInButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      aria-label="확대"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        w-12 h-12
        rounded-2xl
        bg-white
        shadow-md hover:shadow-lg
        text-gray-700 font-medium text-sm
        focus:outline-none
        active:scale-[0.98] transition-all duration-300 ease-in-out
        hover:bg-[#3288FF] hover:text-white
        cursor-pointer
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* 플러스 아이콘 */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-gray-600 group-hover:text-white"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
};

export default ZoomInButton;
