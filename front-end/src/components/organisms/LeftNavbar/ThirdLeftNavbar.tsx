"use client";

import { useState } from 'react';
import TotalMenuBar from '@/components/molecules/LeftNavbar/TotalMenuBar';
import TotalMarketingArea from '@/components/molecules/LeftNavbar/TotalMarketingArea';

const ThirdLeftNavbar = () => {
  const [showMarketingArea, setShowMarketingArea] = useState(false);

  return (
    <div className="w-full bg-white flex flex-col items-center">
      <div className='w-full'>
        {showMarketingArea ? (
          <TotalMarketingArea onClose={() => setShowMarketingArea(false)} />
        ) : (
          <TotalMenuBar onSelectMarket={() => setShowMarketingArea(true)} />
        )}
      </div>
    </div>
  );
}

export default ThirdLeftNavbar;


