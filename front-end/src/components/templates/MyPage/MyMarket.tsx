'use client';

import React, { useState, useEffect } from 'react';
import MyProfileInfo from '@/components/molecules/MyPage/MyProfileInfo';
import SavedMarketCard from '@/components/atoms/Market/Card/SavedMarketCard';
import CheckBox from '@/components/atoms/Market/Button/CheckBox';
// import AlleyMarketBadge from '@/components/atoms/Market/Badge/AlleyMarketBadge';
// import DevelopmentMarketBadge from '@/components/atoms/Market/Badge/DevelopedMarketBadge';
import BtnBack from '@/components/atoms/Common/Button/BtnBack';
import { fetchTradeAreaDetail, TradeAreaDetail, fetchTradeAreaScore, TradeAreaScore } from '@/lib/api/tradeAreas';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useNotification } from '@/components/map/useNotification';
import Notification from '@/components/map/Notification';

interface MyMarketProps {
  onBack?: () => void;
  onCompareClick?: (selectedTradeAreas: { trdarCd: string; trdarCdNm: string }[]) => void;
  onDetailClick?: (trdarCd: string, trdarCdNm: string) => void;
  className?: string;
}

// 하드코딩된 상권 데이터
// const HARDCODED_TRADE_AREAS = [
//   { trdarCd: "3110364", trdarCdNm: "미아역 8번" },
//   { trdarCd: "3110365", trdarCdNm: "미아역 5번" },
//   { trdarCd: "3120077", trdarCdNm: "미아역" },
//   { trdarCd: "3120220", trdarCdNm: "대치역" },
//   { trdarCd: "3111090", trdarCdNm: "강일동주민센터" }
// ];

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
  onDetailClick,
  className = ''
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [tradeAreas, setTradeAreas] = useState<TradeAreaData[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  
  // Context에서 즐겨찾기 관련 상태와 함수 가져오기
  const { favorites, isLoading, error, removeFavorite } = useFavorites();

  // 비교 버튼 활성화 여부: 정확히 2개 선택 시에만 활성화
  const isCompareEnabled = selectedCards.size === 2;

  // 상권 변화 지표 코드를 한국어로 변환
  const getIndicatorName = (indicator: string) => {
    switch (indicator) {
      case "LL": return "다이나믹";
      case "LH": return "상권 확장";
      case "HL": return "상권 축소";
      case "HH": return "정체";
      default: return indicator;
    }
  };

  const handleCardClick = (trdarCd: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trdarCd)) {
        // 이미 선택된 카드면 선택 해제
        newSet.delete(trdarCd);
      } else {
        // 새로운 카드 선택 시 2개 제한 체크
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
        // 체크박스 선택 시 2개 제한 체크
        if (newSet.size >= 2) {
          alert('최대 2개까지만 선택할 수 있습니다.');
          return prev; // 상태 변경하지 않음
        }
        newSet.add(trdarCd);
      } else {
        // 체크박스 해제 시 선택 해제
        newSet.delete(trdarCd);
      }
      return newSet;
    });
  };

  // 저장 해제 기능
  const handleRemoveFavorite = async (trdarCd: string, trdarCdNm: string) => {
    try {
      await removeFavorite(parseInt(trdarCd));
      
      // 선택된 카드에서도 제거
      setSelectedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(trdarCd);
        return newSet;
      });
      
      showNotification(`${trdarCdNm}이 저장 목록에서 제거되었습니다.`);
    } catch (error) {
      console.error('저장 해제 실패:', error);
      showNotification('저장 해제 중 오류가 발생했습니다.');
    }
  };

  // 즐겨찾기 목록이 변경될 때마다 상세 데이터 로드
  useEffect(() => {
    const fetchTradeAreaDetails = async () => {
      if (favorites.length === 0) {
        setTradeAreas([]);
        return;
      }

      setIsLoadingDetails(true);

      try {
        // 상세 데이터와 점수 데이터 가져오기
        const promises = favorites.map(async (area) => {
          try {
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
      } catch (error) {
        console.error('상권 상세 데이터 로딩 실패:', error);
        setTradeAreas([]);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchTradeAreaDetails();
  }, [favorites]);

  return (
    <div className={`bg-white h-screen flex flex-col ${className}`}>
      {/* 헤더 - 고정 */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-start gap-2">
          <BtnBack onClick={onBack} />
          {/* <h1 className="text-lg font-semibold text-gray-900">저장된 상권</h1> */}
          <h1 className="text-lg font-semibold text-gray-900">상권 보관함</h1>
        </div>
        <MyProfileInfo />
      </div>
      
      {/* 카드 목록 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-gray-500">저장된 상권을 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-32 space-y-2">
            <span className="text-red-500 text-center">{error}</span>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              다시 시도
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-32 space-y-2">
            <span className="text-gray-500">저장된 상권이 없습니다.</span>
            <span className="text-sm text-gray-400">상권 상세보기에서 상권을 저장해보세요.</span>
          </div>
        ) : isLoadingDetails ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-gray-500">상권 상세 정보를 불러오는 중...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {tradeAreas.map((area) => {
              const isSelected = selectedCards.has(area.trdarCd);
              return (
              <SavedMarketCard
                key={area.trdarCd}
                className='flex items-start p-4 gap-4 w-full overflow-hidden'
                isSelected={isSelected}
                onClick={() => handleCardClick(area.trdarCd)}
              >            
                 <div 
                   className="flex-shrink-0"
                   onClick={(e) => {
                     e.stopPropagation();
                     e.preventDefault();
                     handleCheckboxChange(area.trdarCd, !isSelected);
                   }}
                 >
                   <CheckBox 
                     checked={isSelected}
                   />
                 </div>
                 <div className='flex flex-col gap-2 w-full min-w-0'>
                   {/* 저장된 상권 카드 헤더 */}
                   <div className="flex justify-between items-start gap-2 min-w-0">
                     <div className='text-lg font-bold flex-1 min-w-0'>
                       <span className="block truncate" title={area.trdarCdNm}>
                         {area.trdarCdNm}
                       </span>
                       {/* <div className='flex space-x-1'>
                         <DevelopmentMarketBadge />
                       </div> */}
                     </div>
                     {/* 버튼들 - 절대 줄바꿈 안됨 */}
                     <div className="flex gap-1 flex-shrink-0">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           e.preventDefault();
                           if (onDetailClick) {
                             onDetailClick(area.trdarCd, area.trdarCdNm);
                           }
                         }}
                        className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 whitespace-nowrap cursor-pointer"
                         title="상권 상세보기"
                       >
                         상세보기
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           e.preventDefault();
                           handleRemoveFavorite(area.trdarCd, area.trdarCdNm);
                         }}
                        className="text-red-500 hover:text-pink-700 text-xs px-2 py-1 rounded bg-pink-50 hover:bg-pink-100 whitespace-nowrap cursor-pointer"
                         title="저장 해제"
                       >
                         저장 해제
                       </button>
                     </div>
                   </div>
                   {/* 저장된 상권 카드 내용 */}
                   <div className='flex flex-col gap-2 border-b pb-2 min-w-0'>
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
                         <div className='flex justify-between items-center min-w-0'>
                           <span className='font-bold text-gray-900 flex-shrink-0'>월 매출액</span>
                           <span className='text-gray-900 text-right truncate ml-2'>{area.detail.sales?.thsmonSelngAmt?.toLocaleString() || '-'}원</span>
                         </div>
                         <div className='flex justify-between items-center min-w-0'>
                           <span className='font-bold text-gray-900 flex-shrink-0'>점포 수</span>
                           <span className='text-gray-900 text-right truncate ml-2'>{area.detail.stor?.storCo?.toLocaleString() || '-'}개</span>
                         </div>
                         <div className='flex justify-between items-center min-w-0'>
                           <span className='font-bold text-gray-900 flex-shrink-0'>상권변화지표</span>
                          <span className='text-gray-900 text-right truncate ml-2'>{getIndicatorName(area.detail.chnge?.trdrChngeIx ?? '') || '-'}</span>
                         </div>
                       </>
                     ) : (
                       <div className='text-center py-4'>
                         <span className='text-gray-500'>데이터 없음</span>
                       </div>
                     )}
                   </div>
                   <div className='flex justify-between items-center min-w-0'>
                     <span className='font-bold text-gray-900 flex-shrink-0'>종합추천점수</span>
                     <span className='text-blue-500 font-bold text-right truncate ml-2'>
                       {area.score?.totalScore ? `${Math.round(area.score.totalScore)}점` : '-'}
                     </span>
                   </div>
                 </div>
               </SavedMarketCard>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 비교하기 버튼 - 하단 고정 */}
      <div className="flex-shrink-0 p-4">
        <div 
          className={`${isCompareEnabled ? 'bg-[#3288FF] cursor-pointer' : 'bg-gray-300 cursor-not-allowed opacity-60'} flex justify-center items-center text-white rounded-lg p-2 transition-colors`}
          role="button"
          aria-disabled={!isCompareEnabled}
          onClick={() => {
            if (!isCompareEnabled) return;
            console.log('🔍 MyMarket 비교하기 버튼 클릭됨');
            console.log('🔍 selectedCards:', selectedCards);
            console.log('🔍 tradeAreas:', tradeAreas);
            if (onCompareClick) {
              const selectedTradeAreas = tradeAreas
                .filter(area => selectedCards.has(area.trdarCd))
                .map(area => ({
                  trdarCd: area.trdarCd,
                  trdarCdNm: area.trdarCdNm
                }));
              console.log('🔍 선택된 상권들:', selectedTradeAreas);
              onCompareClick(selectedTradeAreas);
            } else {
              console.log('❌ onCompareClick이 없음');
            }
          }}
        >
          <span className='text-md'>비교하기</span>
        </div>
      </div>
      
      {/* 토스트 알림 */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default MyMarket;
