'use client';

import React from 'react';

interface BtnBackProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
}

const BtnBack: React.FC<BtnBackProps> = ({
  onClick,
  className = '',
  size = 'md',
  disabled = false,
  ariaLabel = '뒤로가기'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        cursor-pointer
        text-gray-400 hover:text-gray-600
        transition-all duration-200 ease-in-out
        ${className}
      `}
    >
      {/* 왼쪽 화살표 아이콘 */}
      <svg 
        className={iconSizes[size]}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={2}
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
};

export default BtnBack;
