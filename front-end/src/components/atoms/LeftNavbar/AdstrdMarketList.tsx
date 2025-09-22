'use client';

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../../config/api';

// 타입 정의
interface TradeArea {
  trdarSeCd: string;
  trdarSeCdNm: string;
  trdarCd: number;
  trdarCdNm: string;
  xcntsValue: number;
  ydntsValue: number;
  relmAr: number;
  storCo: number;
  similrIndutyStorCo: number;
}

interface TradeAreasResponse {
  districtNameKor: string;
  dongNameKor: string;
  areas: TradeArea[];
}

interface AdstrdMarketListProps {
  district: string;
  dong: string;
  onClose: () => void;
}

export default function AdstrdMarketList({ district, dong, onClose }: AdstrdMarketListProps) {
  const [tradeAreas, setTradeAreas] = useState<TradeArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Props 변화 디버깅
  useEffect(() => {
    console.log('🔍 AdstrdMarketList props 변화:', { district, dong });
  }, [district, dong]);

  // 상권 데이터 로드
  useEffect(() => {
    console.log('🔄 AdstrdMarketList useEffect 트리거:', district, dong);
    
    const loadTradeAreas = async () => {
      if (!district || !dong) {
        console.log('❌ district 또는 dong이 없음:', { district, dong });
        return;
      }

      console.log('🚀 상권 데이터 로드 시작:', district, dong);
      setIsLoading(true);
      setError('');

      try {
        // 파라미터 검증 강화
        if (!district.trim() || !dong.trim()) {
          console.error('❌ district 또는 dong이 비어있음:', { district, dong });
          setError('지역 정보가 올바르지 않습니다.');
          return;
        }

        const url = `${API_ENDPOINTS.TRADE_AREAS}?district=${encodeURIComponent(district.trim())}&dong=${encodeURIComponent(dong.trim())}`;
        console.log(`🌐 상권 리스트 API 호출: ${url}`);
        console.log(`📋 요청 파라미터 - district: "${district}", dong: "${dong}"`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        console.log(`📡 상권 리스트 응답: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 상권 리스트 데이터:', data);

          if (data.isSuccess && data.result) {
            setTradeAreas(data.result.areas || []);
            console.log(`✅ 상권 리스트 로드 완료: ${data.result.areas?.length || 0}개`);
          } else {
            setError('상권 정보를 불러올 수 없습니다.');
          }
        } else {
          // 응답 상태코드와 상태 텍스트 로그
          console.error(`❌ 상권 리스트 API 실패 - 상태: ${response.status} ${response.statusText}`);
          console.error(`❌ 요청 URL: ${url}`);
          console.error(`❌ 요청 파라미터: district="${district}", dong="${dong}"`);
          
          // 400 오류의 경우 더 자세한 정보 제공
          if (response.status === 400) {
            console.error('❌ 400 Bad Request - 요청 파라미터를 확인해주세요');
            setError(`잘못된 요청입니다. 지역 정보를 확인해주세요. (${district}, ${dong})`);
          } else {
            setError(`서버 오류가 발생했습니다. (${response.status})`);
          }
          
          // 응답 본문 읽기 시도
          try {
            const errorText = await response.text();
            console.error('❌ 에러 응답 본문:', errorText);
            
            // JSON 파싱 시도
            try {
              const errorData = JSON.parse(errorText);
              console.error('❌ 에러 데이터 (JSON):', errorData);
            } catch (jsonError) {
              console.error('❌ JSON 파싱 실패, 원본 텍스트:', errorText);
            }
          } catch (textError) {
            console.error('❌ 응답 본문 읽기 실패:', textError);
          }
          
          if (response.status === 500) {
            setError(`${district} ${dong} 지역의 상권 정보를 일시적으로 불러올 수 없습니다. 잠시 후 다시 시도해주세요.`);
          } else {
            setError(`상권 정보를 불러오는데 실패했습니다. (${response.status})`);
          }
        }
      } catch (error) {
        console.error('💥 상권 리스트 API 에러:', error);
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTradeAreas();
  }, [district, dong]);

  return (
    <div className="w-full bg-white flex flex-col h-full max-h-screen">
      {/* 헤더 영역 (고정) */}
      <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
        <h3 className="text-lg font-bold">
          상권 리스트
        </h3>
        <button
          onClick={onClose}
          className="cursor-pointer p-1 rounded-full text-gray-400 hover:text-gray-600 active:text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-all duration-150"
          aria-label="닫기"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 콘텐츠 영역 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">상권 정보를 불러오는 중...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : tradeAreas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">해당 지역에 상권 정보가 없습니다.</p>
          </div>
        ) : (
          tradeAreas.map((area, index) => (
            <div key={`${area.trdarCd}-${index}`} className="border-b border-gray-100 pb-3 last:border-b-0">
              {/* 상권명 */}
              <div className="font-medium text-base mb-2" style={{ color: '#3288FF' }}>
                {area.trdarCdNm}
              </div>
              
              {/* 상권 정보 */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">카페 점포 수</span>
                  <span className="text-gray-500 font-medium">{area.storCo}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">유사 점포 수</span>
                  <span className="text-gray-500 font-medium">{area.similrIndutyStorCo}개</span>
                </div>
              </div>
            </div>
          ))
         )}
        </div>
      </div>
    </div>
  );
}
