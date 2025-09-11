'use client';

import React from 'react';

interface AlleyMarketBadgeProps {
  className?: string;
}

const AlleyMarketBadge: React.FC<AlleyMarketBadgeProps> = ({ 
  className = '' 
}) => {
  return (
    <div
      className={`
        flex items-center justify-center
        bg-green-100 text-green-600 rounded-full
        px-3 py-1 text-xs font-medium
        ${className}
      `}
    >
      골목상권
    </div>
  );
};

export default AlleyMarketBadge;
