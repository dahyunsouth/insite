'use client';

import React from 'react';

interface DevelopedMarketBadgeProps {
  className?: string;
}

const DevelopedMarketBadge: React.FC<DevelopedMarketBadgeProps> = ({ 
  className = '' 
}) => {
  return (
    <div
      className={`
        flex items-center justify-center
        bg-pink-100 text-pink-600 rounded-full
        px-3 text-xs font-medium
        ${className}
      `}
    >
      발달상권
    </div>
  );
};

export default DevelopedMarketBadge;
