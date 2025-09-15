'use client';

import React from 'react';

interface SavedMarketCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const SavedMarketCard: React.FC<SavedMarketCardProps> = ({ 
  children, 
  className = '',
  onClick,
  isSelected = false
}) => {
  const handleClick = () => {
    onClick?.();
  };

  const getCardStyles = () => {
    if (isSelected) {
      // 클릭된 상태: #3288FF 테두리 + #3288FF 10% 배경
      return 'border border-[#3288FF] bg-[#3288FF]/10';
    }
    return 'border border-gray-300 bg-white hover:border hover:border-gray-400';
  };

  return (
    <div
      className={`
        ${getCardStyles()}
        rounded-lg transition-all duration-200 ease-in-out
        cursor-pointer
        ${className}
      `}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default SavedMarketCard;
