"use client";

import React from 'react';
import AdstrdMarketList from '@/components/atoms/LeftNavbar/AdstrdMarketList';

interface FifthLeftNavbarProps {
  isVisible: boolean;
  district: string;
  dong: string;
  onClose: () => void;
}

const FifthLeftNavbar: React.FC<FifthLeftNavbarProps> = ({ 
  isVisible, 
  district, 
  dong, 
  onClose 
}) => {
  // Props 변화 디버깅
  console.log('🔍 FifthLeftNavbar props:', { isVisible, district, dong });
  
  if (!isVisible) {
    console.log('❌ FifthLeftNavbar 숨김 상태');
    return null;
  }

  console.log('✅ FifthLeftNavbar 표시 상태');

  return (
    <div className="w-full bg-white flex flex-col items-center h-full max-h-screen">
      <div className='w-full h-full'>
        <AdstrdMarketList 
          district={district}
          dong={dong}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default FifthLeftNavbar;
