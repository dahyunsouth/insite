'use client';

import React, { useState, useEffect } from 'react';
import MyProfileInfo from '@/components/molecules/MyPage/MyProfileInfo';
import SavedMarketCard from '@/components/atoms/Market/Card/SavedMarketCard';
import CheckBox from '@/components/atoms/Market/Button/CheckBox';
import AlleyMarketBadge from '@/components/atoms/Market/Badge/AlleyMarketBadge';
import DevelopmentMarketBadge from '@/components/atoms/Market/Badge/DevelopedMarketBadge';
import BestClickMarketBadge from '@/components/atoms/Market/Badge/BestClickMarket';
import BtnBack from '@/components/atoms/Common/Button/BtnBack';
import { fetchTradeAreaDetail, TradeAreaDetail, fetchTradeAreaScore, TradeAreaScore } from '@/lib/api/tradeAreas';

interface MyMarketProps {
  onBack?: () => void;
  onCompareClick?: () => void;
  className?: string;
}

// 하드코딩된 상권 데이터
const HARDCODED_TRADE_AREAS = [
  { trdarCd: "3110364", trdarCdNm: "미아역 8번" },
  { trdarCd: "3110365", trdarCdNm: "미아역 5번" },
  { trdarCd: "3120077", trdarCdNm: "미아역" },
  { trdarCd: "3120220", trdarCdNm: "대치역" },
  { trdarCd: "3111090", trdarCdNm: "강일동주민센터" }
];

interface TradeAreaData {
  trdarCd: string;
  trdarCdNm: string;
  detail?: TradeAreaDetail;
  score?: TradeAreaScore;
  loading: boolean;
  error?: string;
}

const MyMarket: React.FC<MyMarketProps> = ({
  onBack,
  onCompareClick,
  className = ''
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [tradeAreas, setTradeAreas] = useState<TradeAreaData[]>(
    HARDCODED_TRADE_AREAS.map(area => ({
      ...area,
      loading: true,
      error: undefined
    }))
  );

  const handleCardClick = (trdarCd: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trdarCd)) {
        newSet.delete(trdarCd);
      } else {
        // 2개까지만 선택 가능
        if (newSet.size >= 2) {
          alert('최대 2개까지만 선택할 수 있습니다.');
          return prev;
        }
        newSet.add(trdarCd);
      }
      return newSet;
    });
  };

  const handleCheckboxChange = (trdarCd: string, checked: boolean) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (checked) {
        // 2개까지만 선택 가능
        if (newSet.size >= 2) {
          alert('최대 2개까지만 선택할 수 있습니다.');
          return prev;
        }
        newSet.add(trdarCd);
      } else {
        newSet.delete(trdarCd);
      }
      return newSet;
    });
  };

  // API 호출하여 상권 상세 데이터와 점수 데이터 가져오기
  useEffect(() => {
    const fetchTradeAreaDetails = async () => {
      const promises = HARDCODED_TRADE_AREAS.map(async (area) => {
        try {
          // 상세 데이터와 점수 데이터를 병렬로 가져오기
          const [detail, score] = await Promise.all([
            fetchTradeAreaDetail(area.trdarCd),
            fetchTradeAreaScore(area.trdarCdNm)
          ]);
          
          return {
            ...area,
            detail,
            score,
            loading: false,
            error: undefined
          };
        } catch (error) {
          console.error(`Error fetching data for ${area.trdarCdNm}:`, error);
          return {
            ...area,
            detail: undefined,
            score: undefined,
            loading: false,
            error: '데이터 로딩 실패'
          };
        }
      });

      const results = await Promise.all(promises);
      setTradeAreas(results);
    };

    fetchTradeAreaDetails();
  }, []);

  return (
    <div className={`bg-white h-screen flex flex-col ${className}`}>
      {/* 헤더 - 고정 */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-start gap-2">
          <BtnBack onClick={onBack} />
          <h1 className="text-lg font-semibold text-gray-900">저장된 상권</h1>
        </div>
        <MyProfileInfo />
      </div>
      
      {/* 카드 목록 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          {tradeAreas.map((area, index) => {
            const isSelected = selectedCards.has(area.trdarCd);
            return (
            <SavedMarketCard
              key={area.trdarCd}
              className='flex items-start p-4 gap-4'
              isSelected={isSelected}
              onClick={() => handleCardClick(area.trdarCd)}
            >            
               <div 
                 className="flex-shrink-0"
                 onClick={(e) => {
                   e.stopPropagation();
                   handleCheckboxChange(area.trdarCd, !isSelected);
                 }}
               >
                 <CheckBox 
                   checked={isSelected}
                   onChange={(checked) => {
                     handleCheckboxChange(area.trdarCd, checked);
                   }}
                 />
               </div>
               <div className='flex flex-col gap-2 w-full'>
                 {/* 저장된 상권 카드 헤더 */}
                 <div>
                    <div className='text-lg font-bold flex justify-start space-x-2'>
                      <span>{area.trdarCdNm}</span>
                      <div className='flex space-x-1'>
                        <DevelopmentMarketBadge />
                        <BestClickMarketBadge />
                      </div>
                    </div>
                 </div>
                 {/* 저장된 상권 카드 내용 */}
                 <div className='flex flex-col gap-2 border-b pb-2'>
                   {area.loading ? (
                     <div className='text-center py-4'>
                       <span className='text-gray-500'>데이터 로딩 중...</span>
                     </div>
                   ) : area.error ? (
                     <div className='text-center py-4'>
                       <span className='text-red-500'>{area.error}</span>
                     </div>
                   ) : area.detail ? (
                     <>
                       <div className='flex justify-between'>
                         <span className='font-bold text-gray-900'>월 매출액</span>
                         <span className='text-gray-900'>{area.detail.sales?.thsmonSelngAmt?.toLocaleString() || '-'}원</span>
                       </div>
                       <div className='flex justify-between'>
                         <span className='font-bold text-gray-900'>점포 수</span>
                         <span className='text-gray-900'>{area.detail.stor?.storCo?.toLocaleString() || '-'}개</span>
                       </div>
                       <div className='flex justify-between'>
                         <span className='font-bold text-gray-900'>상권변화지표</span>
                         <span className='text-gray-900'>{area.detail.chnge?.trdrChngeIx || '-'}</span>
                       </div>
                     </>
                   ) : (
                     <div className='text-center py-4'>
                       <span className='text-gray-500'>데이터 없음</span>
                     </div>
                   )}
                 </div>
                 <div className='flex justify-between'>
                   <span className='font-bold text-gray-900'>종합추천점수</span>
                   <span className='text-blue-500 font-bold'>
                     {area.score?.totalScore ? `${Math.round(area.score.totalScore)}점` : '-'}
                   </span>
                 </div>
               </div>
             </SavedMarketCard>
            );
          })}
        </div>
      </div>
      
      {/* 비교하기 버튼 - 하단 고정 */}
      <div className="flex-shrink-0 p-4">
        <div 
          className='cursor-pointer flex justify-center items-center bg-[#3288FF] text-white rounded-lg p-2'
          onClick={onCompareClick}
        >
          <span className='text-md'>비교하기</span>
        </div>
      </div>
    </div>
  );
};

export default MyMarket;
