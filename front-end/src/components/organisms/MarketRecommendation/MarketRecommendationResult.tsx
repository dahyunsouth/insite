'use client';

import React from 'react';
import Image from 'next/image';

interface MarketRecommendationResultProps {
  onBack?: () => void;
}

const MarketRecommendationResult: React.FC<MarketRecommendationResultProps> = ({ onBack }) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-4 border-b">
        <button
          onClick={onBack}
          className="cursor-pointer rounded-xl px-4 py-3
          text-gray-400 hover:text-gray-800">
          &lt;
        </button>
        <h1 className="text-3xl font-semibold text-gray-800">🎉 사용자 이름님을 위한 추천 결과</h1>
        <div className="w-16"></div> {/* 중앙 정렬을 위한 빈 공간 */}
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-col flex-1 pt-4 gap-4 h-full">
        {/* 1등 영역 */}
        <button className="cursor-pointer flex flex-1 border border-orange-500 bg-orange-50 rounded-xl py-4 px-12">
          {/* 1등 배지 영역 */}
          <div className="flex flex-col gap-4 justify-center items-center flex-1 p-4">
            <div className="flex items-center justify-center flex-1">
              <Image src='/badges/ic_first.svg'
                alt="IconFirst" width={160} height={160}
                className="w-full h-full object-contain" />
            </div>
          
            <div className='flex justify-between items-center bg-orange-500 rounded-full text-white px-6 py-2'>
              종합 추천 점수
              <span>100점</span>
            </div>
          </div>
          <div className='flex flex-col flex-1 justify-center'>
            <div className="flex border-b border-orange-500 pb-4 mb-4">
              <div className='text-2xl font-bold text-gray-800'>1등 상권명</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">레이아웃을 작성해주세요.</p>
            </div>
          </div>
        </button>
        {/* 2등, 3등 영역 */}
        <div className='flex-1 flex gap-4'>
          {/* 2등 영역 */}
          <button className="cursor-pointer flex flex-1 border border-blue-500 bg-blue-50 rounded-xl py-1 px-6">
            {/* 2등 배지 영역 */}
            <div className="flex flex-col gap-4 justify-center items-center flex-1 p-4">
              <div className="flex items-center justify-center flex-1">
                <Image src='/badges/ic_second.svg'
                  alt="IconFirst" width={160} height={160}
                  className="w-full h-full object-contain" />
              </div>
            
              <div className='flex justify-between items-center bg-blue-500 rounded-full text-white px-6 py-2'>
                종합 추천 점수
                <span>100점</span>
              </div>
            </div>
            <div className='flex flex-col flex-1 justify-center'>
              <div className="flex border-b border-blue-500 pb-4 mb-4">
                <div className='text-2xl font-bold text-gray-800'>2등 상권명</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">레이아웃을 작성해주세요.</p>
              </div>
            </div>
          </button> 
          {/* 3등 영역 */}
          <button className="cursor-pointer flex flex-1 border border-green-500 bg-green-50 rounded-xl py-1 px-6">
            {/* 3등 배지 영역 */}
            <div className="flex flex-col gap-4 justify-center items-center flex-1 p-4">
              <div className="flex items-center justify-center flex-1">
                <Image src='/badges/ic_third.svg'
                  alt="IconFirst" width={160} height={160}
                  className="w-full h-full object-contain" />
              </div>
            
              <div className='flex justify-between items-center bg-green-700 rounded-full text-white px-6 py-2'>
                종합 추천 점수
                <span>100점</span>
              </div>
            </div>
            <div className='flex flex-col flex-1 justify-center'>
              <div className="flex border-b border-green-500 pb-4 mb-4">
                <div className='text-2xl font-bold text-gray-800'>3등 상권명</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">레이아웃을 작성해주세요.</p>
              </div>
            </div>
          </button> 
        </div>
      </div>
    </div>
  );
};

export default MarketRecommendationResult;
