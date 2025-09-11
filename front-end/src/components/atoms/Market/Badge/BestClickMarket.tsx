'use client';

import React from 'react';

interface BestClickMarketProps {
  className?: string;
}

const BestClickMarket: React.FC<BestClickMarketProps> = ({ 
  className = '' 
}) => {
  return (
    <div
      className={`
        flex items-center justify-center
        bg-orange-100 text-orange-600 rounded-full
        px-3 text-xs font-medium
        ${className}
      `}
    >
      최근 조회수가 많은 상권
    </div>
  );
};

export default BestClickMarket;
