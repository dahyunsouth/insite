'use client';

import React from 'react';
import ZoomInButton from '@/components/atoms/RightActionBar/ZoomInButton';
import ZoomOutButton from '@/components/atoms/RightActionBar/ZoomOutButton';

interface ZoomFucProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  className?: string;
}

const ZoomFuc: React.FC<ZoomFucProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <ZoomInButton onClick={onZoomIn} />
      <ZoomOutButton onClick={onZoomOut} />
    </div>
  );
};

export default ZoomFuc;
