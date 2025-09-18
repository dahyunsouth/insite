"use client";

import { useState } from 'react';
import TotalMenuBar from '@/components/molecules/LeftNavbar/TotalMenuBar';
import TotalMarketingArea from '@/components/molecules/LeftNavbar/TotalMarketingArea';
import TotalMonthlySales from '@/components/molecules/LeftNavbar/TotalMonthlySales';
interface ThirdLeftNavbarProps {
  onMarketingAreaChange?: (show: boolean) => void;
  showMarketingArea?: boolean;
}

const ThirdLeftNavbar: React.FC<ThirdLeftNavbarProps> = ({ 
  onMarketingAreaChange, 
  showMarketingArea = false
}) => {
  const [showMonthlySales, setShowMonthlySales] = useState(false);

  const handleMarketingAreaToggle = (show: boolean) => {
    onMarketingAreaChange?.(show);
  };

  const handleMonthlySalesToggle = (show: boolean) => {
    setShowMonthlySales(show);
    // 월매출 모드일 때는 상권 모드 비활성화
    if (show) {
      onMarketingAreaChange?.(false);
    }
  };

  return (
    <div className="w-full bg-white flex flex-col items-center">
      <div className='w-full'>
        {showMarketingArea ? (
          <TotalMarketingArea onClose={() => handleMarketingAreaToggle(false)} />
        ) : showMonthlySales ? (
          <TotalMonthlySales onClose={() => handleMonthlySalesToggle(false)} />
        ) : (
          <TotalMenuBar 
            onSelectMarket={() => handleMarketingAreaToggle(true)}
            onSelectMonthlySales={() => handleMonthlySalesToggle(true)}
          />
        )}
      </div>
    </div>
  );
}

export default ThirdLeftNavbar;


