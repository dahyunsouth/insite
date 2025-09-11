'use client';

import React, { useState } from 'react';
import MyProfileInfo from '@/components/molecules/MyPage/MyProfileInfo';
import SavedMarketCard from '@/components/atoms/Market/Card/SavedMarketCard';
import CheckBox from '@/components/atoms/Market/Button/CheckBox';
import AlleyMarketBadge from '@/components/atoms/Market/Badge/AlleyMarketBadge';
import DevelopmentMarketBadge from '@/components/atoms/Market/Badge/DevelopedMarketBadge';
import BestClickMarketBadge from '@/components/atoms/Market/Badge/BestClickMarket';
import BtnBack from '@/components/atoms/Common/Button/BtnBack';

interface MyMarketProps {
  onBack?: () => void;
  className?: string;
}

const MyMarket: React.FC<MyMarketProps> = ({
  onBack,
  className = ''
}) => {
  const [isCardSelected, setIsCardSelected] = useState(false);

  const handleCardClick = () => {
    setIsCardSelected(!isCardSelected);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsCardSelected(checked);
  };

  return (
    <div className={`p-4 bg-white h-screen ${className}`}>
      <div className="flex items-center justify-start gap-2">
        <BtnBack onClick={onBack} />
        <h1 className="text-lg font-semibold text-gray-900">저장된 상권</h1>
      </div>
      <MyProfileInfo />
      <div className="space-y-4 mt-4">
        {/* 저장된 상권 목록이 들어갈 영역 */}
        <div className="text-center text-gray-900">
           <SavedMarketCard
             className='flex items-start p-4 gap-4'
             isSelected={isCardSelected}
             onClick={handleCardClick}
           >            
             <CheckBox 
               checked={isCardSelected}
               onChange={handleCheckboxChange}
             />
             <div className='flex flex-col gap-2 w-full'>
               {/* 저장된 상권 카드 헤더 */}
               <div>
                  <div className='text-lg font-bold flex justify-start space-x-2'>
                    <span>상권명</span>
                    <div className='flex space-x-1'>
                      <DevelopmentMarketBadge />
                      <BestClickMarketBadge />
                    </div>
                  </div>
               </div>
               {/* 저장된 상권 카드 내용 */}
               <div className='flex flex-col gap-2 border-b border-blue-500 pb-2'>
                 <div className='flex justify-between'>
                   <span className='font-bold'>월 매출</span>
                   <span>10000000원</span>
                 </div>
                 <div className='flex justify-between'>
                   <span className='font-bold'>유동인구</span>
                   <span>10000000명</span>
                 </div>
                 <div className='flex justify-between'>
                   <span className='font-bold'>평균 임대료</span>
                   <span>10000000원</span>
                 </div>
               </div>
               <div className='flex justify-between'>
                 <span className='font-bold'>종합평가점수</span>
                 <span className='text-blue-500 font-bold'>100점</span>
               </div>
             </div>
           </SavedMarketCard>
        </div>
      </div>
    </div>
  );
};

export default MyMarket;
