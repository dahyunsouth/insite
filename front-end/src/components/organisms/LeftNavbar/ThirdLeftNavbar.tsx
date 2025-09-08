"use client";

import { useState } from 'react';
import TotalMenuBar from '@/components/molecules/LeftNavbar/TotalMenuBar';
import TotalMarketingArea from '@/components/molecules/LeftNavbar/TotalMarketingArea';
import TotalMonthlySales from '@/components/molecules/LeftNavbar/TotalMonthlySales';

const ThirdLeftNavbar = () => {
  const [showMarketingArea, setShowMarketingArea] = useState(false);
  const [showMonthlySales, setShowMonthlySales] = useState(false);

  return (
    <div className="w-full bg-white flex flex-col items-center">
      <div className='w-full'>
        {showMarketingArea ? (
          <TotalMarketingArea onClose={() => setShowMarketingArea(false)} />
        ) : showMonthlySales ? (
          <TotalMonthlySales onClose={() => setShowMonthlySales(false)} />
        ) : (
          <TotalMenuBar 
            onSelectMarket={() => setShowMarketingArea(true)}
            onSelectMonthlySales={() => setShowMonthlySales(true)}
          />
        )}
      </div>
    </div>
  );
}

export default ThirdLeftNavbar;


