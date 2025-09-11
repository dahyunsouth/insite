import React from 'react';
import Image from 'next/image';
import AI from '/public/AI.svg';

interface MarketRecommandButtonProps {
  // 필요한 props는 나중에 추가
}

const MarketRecommandButton: React.FC<MarketRecommandButtonProps> = () => {
  return (
    <div className='flex items-center justify-center gap-2 bg-gradient-to-r from-[#3288FF] to-[#00FFB2]'>
      <Image src={AI} alt="AI" width={16} height={16} />
      <span className='text-sm font-medium text-white'>상권 추천</span>
    </div>
  );
};

export default MarketRecommandButton;
