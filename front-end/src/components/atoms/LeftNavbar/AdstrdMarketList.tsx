'use client';

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import seoulDistricts from '@/data/seoulDistricts.json';

// 상권 데이터 캐시 (역삼1동 강남구 초기 데이터) - 실제 데이터 기반
// 서버에서 요구하는 정확한 행정동명 사용
const INITIAL_TRADE_AREA_CACHE = {
  '강남구-역삼1동': [
    {
      trdarSeCd: 'D',
      trdarSeCdNm: '발달상권',
      trdarCd: 3120197,
      trdarCdNm: '역삼역',
      xcntsValue: 203179,
      ydntsValue: 444549,
      relmAr: 562807,
      storCo: 25, // 실제 카페 점포 수로 추정
      similrIndutyStorCo: 15 // 실제 유사 점포 수로 추정
    },
    {
      trdarSeCd: 'D',
      trdarSeCdNm: '발달상권',
      trdarCd: 3120198,
      trdarCdNm: '구역삼세무서',
      xcntsValue: 203290,
      ydntsValue: 444009,
      relmAr: 291470,
      storCo: 18,
      similrIndutyStorCo: 12
    },
    {
      trdarSeCd: 'A',
      trdarSeCdNm: '골목상권',
      trdarCd: 3110958,
      trdarCdNm: '역삼역 4번',
      xcntsValue: 202887,
      ydntsValue: 444846,
      relmAr: 73119,
      storCo: 12,
      similrIndutyStorCo: 8
    },
    {
      trdarSeCd: 'A',
      trdarSeCdNm: '골목상권',
      trdarCd: 3110967,
      trdarCdNm: '역삼역 8번',
      xcntsValue: 203374,
      ydntsValue: 445011,
      relmAr: 68672,
      storCo: 10,
      similrIndutyStorCo: 6
    },
    {
      trdarSeCd: 'A',
      trdarSeCdNm: '골목상권',
      trdarCd: 3110956,
      trdarCdNm: '언주역 8번',
      xcntsValue: 202762,
      ydntsValue: 445017,
      relmAr: 71587,
      storCo: 14,
      similrIndutyStorCo: 9
    }
  ]
};

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
  onTradeAreaSelect?: (tradeArea: TradeArea) => void;
  selectedTradeArea?: TradeArea | null;
}

export default function AdstrdMarketList({ district, dong, onClose, onTradeAreaSelect, selectedTradeArea }: AdstrdMarketListProps) {
  const [tradeAreas, setTradeAreas] = useState<TradeArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 초기 로딩 상태를 false로 변경
  const [error, setError] = useState<string>('');

  // Props 변화 디버깅
  useEffect(() => {
    console.log('🔍 AdstrdMarketList props 변화:', { district, dong });
  }, [district, dong]);

  // 상권 데이터 로드 (캐시 우선)
  useEffect(() => {
    console.log('🔄 AdstrdMarketList useEffect 트리거:', district, dong);
    
    const loadTradeAreas = async () => {
      if (!district || !dong) {
        console.log('❌ district 또는 dong이 없음:', { district, dong });
        return;
      }

      // 서울 자치구 검증: seoulDistricts.json에 없는 구는 서비스 미지원 안내
      try {
        const seoulGuSet = new Set<string>((seoulDistricts as any)?.features?.map((f: any) => f?.properties?.name));
        const isSeoulGu = seoulGuSet.has(district.trim());
        if (!isSeoulGu) {
          console.warn(`⚠️ 비서울 자치구 요청 감지: "${district}" "${dong}"`);
          setTradeAreas([]);
          setIsLoading(false);
          setError('현재 서울 시만 서비스를 지원하고 있습니다.');
          return;
        }
      } catch (e) {
        console.warn('seoulDistricts 검증 중 예외, 기본 로직 진행:', e);
      }

      // 행정동명 정규화 함수 (역삼동 -> 역삼1동)
      const normalizeDongName = (dong: string): string => {
        const trimmed = dong.trim();
        let normalized = trimmed.replace(/[\.|·|ㆍ]/g, '?'); // 종로1.2.3.4가동/종로1·2·3·4가동 → 종로1?2?3?4가동
        if (normalized === '역삼동') {
          return '역삼1동';
        }
        // 면목제3.8동, 면목3?8동, 면목3.8동, 면목3ㆍ8동 등 → 면목3?8동으로 통일
        const noSpace = normalized.replace(/\s+/g, '');
        if (/^면목(제)?3[\.·ㆍ\?]8동$/.test(noSpace)) {
          normalized = '면목3?8동';
        }
        return normalized;
      };

      const normalizedDong = normalizeDongName(dong);
      const cacheKey = `${district}-${normalizedDong}`;
      
       // 캐시된 데이터 확인 (정확한 키 매칭)
       const cachedData = INITIAL_TRADE_AREA_CACHE[cacheKey as keyof typeof INITIAL_TRADE_AREA_CACHE];
       if (cachedData) {
         console.log('🚀 캐시된 상권 데이터 사용:', cacheKey);
         setTradeAreas(cachedData);
         setIsLoading(false);
         setError('');
         
         // 백그라운드에서 최신 데이터 업데이트
         setTimeout(() => {
           fetchLatestData(district, dong);
         }, 1000);
         return;
       } else {
         console.log('📝 캐시에 없는 지역:', cacheKey, '사용 가능한 캐시 키들:', Object.keys(INITIAL_TRADE_AREA_CACHE));
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

        await fetchLatestData(district, dong);
      } catch (error) {
        console.error('❌ 상권 데이터 로드 실패:', error);
        setError('상권 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    // 행정동명 정규화 함수 (역삼동 -> 역삼1동)
    const normalizeDongName = (dong: string): string => {
      const trimmed = dong.trim();
      let normalized = trimmed.replace(/[\.|·|ㆍ]/g, '?'); // 종로1.2.3.4가동/종로1·2·3·4가동 → 종로1?2?3?4가동
      // 역삼동은 역삼1동으로 변환 (서버에서 요구하는 정확한 행정동명)
      if (normalized === '역삼동') {
        return '역삼1동';
      }
      // 면목제3.8동, 면목3?8동, 면목3.8동, 면목3ㆍ8동 등 → 면목3?8동으로 통일
      const noSpace = normalized.replace(/\s+/g, '');
      if (/^면목(제)?3[\.·ㆍ\?]8동$/.test(noSpace)) {
        normalized = '면목3?8동';
      }
      return normalized;
    };

    const fetchLatestData = async (district: string, dong: string) => {
      try {
        const normalizedDong = normalizeDongName(dong);
        // 항상 정규화된 행정동명으로만 호출
        const url = `${API_ENDPOINTS.TRADE_AREAS}?district=${encodeURIComponent(district)}&dong=${encodeURIComponent(normalizedDong)}`;
        console.log(`🌐 상권 리스트 API 호출: ${url}`);
        console.log(`📝 요청 파라미터: district="${district}", dong="${dong}" -> "${normalizedDong}"`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        console.log(`📡 상권 리스트 응답: ${response.status} ${response.statusText}`);
        console.log(`🔍 응답 URL: ${response.url}`);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 상권 리스트 데이터:', data);

          // API 응답 형식에 맞게 데이터 처리
          if (data.isSuccess && data.result && data.result.areas) {
            setTradeAreas(data.result.areas);
            console.log(`✅ 상권 리스트 로드 완료: ${data.result.areas.length}개`);
            console.log(`📍 지역: ${data.result.districtNameKor} ${data.result.dongNameKor}`);
          } else {
            console.warn('⚠️ API 응답에 상권 데이터가 없음:', data);
            setError('해당 지역에 상권 정보가 없습니다.');
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
          
          // 서버 에러 응답 처리
          let errorMessage = `상권 정보를 불러오는데 실패했습니다. (${response.status})`;
          
          try {
            const errorText = await response.text();
            if (errorText) {
              const errorData = JSON.parse(errorText);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            }
          } catch (parseError) {
            console.error('에러 응답 파싱 실패:', parseError);
          }
          
          if (response.status === 500) {
            setError(`${district} ${normalizedDong} 지역의 상권 정보를 일시적으로 불러올 수 없습니다. 잠시 후 다시 시도해주세요.`);
          } else if (response.status === 400) {
            setError(`잘못된 요청입니다. ${errorMessage}`);
          } else if (response.status === 404) {
            setError(`해당 지역(${district} ${normalizedDong})의 상권 정보를 찾을 수 없습니다.`);
          } else {
            setError(errorMessage);
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
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <h3 className="text-lg font-bold">
          상권 목록
        </h3>
        {/* <button
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
        </button> */}
      </div>

      {/* 콘텐츠 영역 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto">
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
            <div className="text-3xl mb-2">😢</div>
            <p className="text-gray-800 text-sm">{error}</p>
          </div>
        ) : tradeAreas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">해당 지역에 상권 정보가 없습니다.</p>
          </div>
        ) : (
          tradeAreas.map((area, index) => {
            const isSelected = selectedTradeArea?.trdarCd === area.trdarCd;
            
            return (
              <div 
                key={`${area.trdarCd}-${index}`} 
                className={`border-b border-gray-100 px-6 last:border-b-0 cursor-pointer transition-all duration-200 p-3 hover:bg-blue-50 ${
                  isSelected ? 'bg-gray-200 border-blue-200' : ''
                }`}
                onClick={() => {
                  console.log('🏪 상권 카드 클릭됨:', area);
                  if (onTradeAreaSelect) {
                    console.log('✅ onTradeAreaSelect 콜백 호출');
                    onTradeAreaSelect(area);
                  } else {
                    console.log('❌ onTradeAreaSelect 콜백이 없음');
                  }
                }}
              >
                {/* 상권명 */}
                <div className="font-medium text-base mb-2" style={{ color: isSelected ? '#000000' : '#3288FF' }}>
                  {area.trdarCdNm}
                  {isSelected && (
                    <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      선택됨
                    </span>
                  )}
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
            );
          })
         )}
        </div>
      </div>
    </div>
  );
}
