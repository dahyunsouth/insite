'use client';

import React, { useEffect, useState } from 'react';
import { useKakaoMapContext } from '../../map/KakaoMap';

interface NowAddressProps {
  onAddressClick?: (district: string, dong: string) => void;
  onAddressChange?: (district: string, dong: string) => void;
}

// 초기 주소 캐시: 성동구 성수2가1동
const INITIAL_ADDRESS_CACHE = {
  gu: '성동구',
  dong: '성수2가1동',
  // 성수동카페거리 중심 좌표(TradeAreaValue.json 기반 TM→WGS84 변환값을 KakaoMap Provider에서 사용 중):
  // 여기서는 근사 좌표로 빠른 초기 표기를 우선
  coordinates: { lat: 37.5446, lng: 127.0554 }
};

export default function NowAddress({ onAddressClick, onAddressChange }: NowAddressProps) {
  const { map } = useKakaoMapContext();
  const [currentAddress, setCurrentAddress] = useState<{
    gu: string;
    dong: string;
  }>(INITIAL_ADDRESS_CACHE);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 초기 로딩 상태를 false로 변경

  // 좌표로 주소 검색하는 함수 (카카오맵 가이드 코드 기반)
  const searchAddrFromCoords = (coords: any, callback: (result: any[], status: any) => void) => {
    if (!window.kakao || !(window as any).kakao?.maps?.services) {
      console.log('❌ 카카오맵 services가 로드되지 않음');
      setIsLoading(false);
      return;
    }

    const geocoder = new (window as any).kakao.maps.services.Geocoder();
    
    // 좌표로 행정동 주소 정보를 요청합니다 (가이드 코드와 동일)
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
  };

  // 지도 중심좌표에 대한 주소정보를 표출하는 함수 (가이드 코드 기반)
  const displayCenterInfo = (result: any[], status: any) => {
    console.log('🌍 Geocoder 호출 결과:', { result, status });
    
    if (status === (window as any).kakao.maps.services.Status.OK) {
      console.log('✅ Geocoder 성공, 결과 개수:', result.length);
      
      let gu = '';
      let dong = '';
      
        for (let i = 0; i < result.length; i++) {
          console.log(`📋 결과 ${i}:`, result[i]);
          console.log(`  - region_type: ${result[i].region_type}`);
          console.log(`  - address_name: "${result[i].address_name}"`);
          console.log(`  - region_1depth_name: "${result[i].region_1depth_name}"`);
          console.log(`  - region_2depth_name: "${result[i].region_2depth_name}"`);
          console.log(`  - region_3depth_name: "${result[i].region_3depth_name}"`);
          
          // 자치구 정보 찾기 - region_2depth_name 사용 (구 단위)
          if (result[i].region_type === 'B' && result[i].region_2depth_name && result[i].region_2depth_name.includes('구')) {
            gu = result[i].region_2depth_name; // "강남구"만 추출
            console.log(`🏢 자치구 발견 (region_2depth): ${gu}`);
          }
          
          // 행정동 정보 찾기 - 우선순위: H > B > L (행정동 > 법정동 > 리)
          if (result[i].region_type === 'H' && result[i].region_3depth_name) {
            // 행정동이 가장 정확함 (예: 역삼1동, 역삼2동)
            dong = result[i].region_3depth_name;
            console.log(`🏠 행정동 발견 (region_3depth): ${dong}`);
          } else if (result[i].region_type === 'B' && result[i].region_3depth_name && !dong) {
            // 법정동은 행정동이 없을 때만 사용 (예: 역삼동)
            dong = result[i].region_3depth_name;
            console.log(`🏘️ 법정동 발견 (region_3depth): ${dong}`);
          } else if (result[i].region_type === 'L' && result[i].region_3depth_name && !dong) {
            // 리는 마지막 옵션
            dong = result[i].region_3depth_name;
            console.log(`🌳 리 발견 (region_3depth): ${dong}`);
          }
        }
      
      console.log(`📍 최종 주소: ${gu} ${dong}`);
      setCurrentAddress({ gu, dong });
      setIsLoading(false);
      
      // 주소 변경 콜백 호출
      if (onAddressChange && gu && dong) {
        console.log(`📞 주소 변경 콜백 호출: ${gu} ${dong}`);
        console.log(`🔗 onAddressChange 콜백 존재:`, !!onAddressChange);
        console.log(`📝 전달할 파라미터 검증:`, {
          district: gu,
          dong: dong,
          districtLength: gu.length,
          dongLength: dong.length,
          districtTrimmed: gu.trim(),
          dongTrimmed: dong.trim()
        });
        onAddressChange(gu, dong);
        console.log(`✅ 주소 변경 콜백 호출 완료`);
      } else {
        console.log(`❌ 주소 변경 콜백 호출 안함:`, { 
          hasCallback: !!onAddressChange, 
          hasGu: !!gu, 
          hasDong: !!dong,
          guValue: gu,
          dongValue: dong
        });
      }
    } else {
      console.error('❌ Geocoder 실패:', status);
      setCurrentAddress({ gu: '알 수 없음', dong: '알 수 없음' });
      setIsLoading(false);
    }
  };

  // 초기 주소 캐시 적용 및 지도 중심 좌표 변경 시 주소 업데이트
  useEffect(() => {
    if (!map || !window.kakao) {
      console.log('❌ 지도 또는 카카오맵이 준비되지 않음');
      return;
    }

    // 초기 주소 캐시 적용 (즉시 표시)
    console.log('🚀 초기 주소 캐시 적용:', INITIAL_ADDRESS_CACHE);
    if (onAddressChange) {
      onAddressChange(INITIAL_ADDRESS_CACHE.gu, INITIAL_ADDRESS_CACHE.dong);
    }

    // services가 로드될 때까지 대기
    const checkServicesAndStart = () => {
      if (!(window as any).kakao?.maps?.services) {
        console.log('⏳ 카카오맵 services 로딩 대기 중...');
        setTimeout(checkServicesAndStart, 100);
        return;
      }

      console.log('🗺️ 카카오맵 services 준비 완료, 주소 검색 시작');

      // 현재 지도 중심좌표로 주소를 검색해서 표시합니다 (가이드 코드와 동일)
      const initialCenter = map.getCenter();
      console.log('📍 초기 중심 좌표:', initialCenter.getLat(), initialCenter.getLng());
      
      // 초기 좌표가 캐시된 좌표와 다를 때만 검색
      const currentLat = initialCenter.getLat();
      const currentLng = initialCenter.getLng();
      const cacheLat = INITIAL_ADDRESS_CACHE.coordinates.lat;
      const cacheLng = INITIAL_ADDRESS_CACHE.coordinates.lng;
      
      const isDifferentFromCache = Math.abs(currentLat - cacheLat) > 0.001 || Math.abs(currentLng - cacheLng) > 0.001;
      
      if (isDifferentFromCache) {
        console.log('🔄 캐시와 다른 좌표, 주소 재검색');
        searchAddrFromCoords(initialCenter, displayCenterInfo);
      } else {
        console.log('✅ 캐시된 주소 사용');
      }

      // 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다 (가이드 코드와 동일)
      const idleListener = () => {
        const center = map.getCenter();
        console.log('🔄 지도 이동 완료, 새 중심 좌표:', center.getLat(), center.getLng());
        searchAddrFromCoords(center, displayCenterInfo);
      };

      (window as any).kakao.maps.event.addListener(map, 'idle', idleListener);

      // cleanup 함수에서 이벤트 리스너 제거
      return () => {
        if ((window as any).kakao?.maps?.event) {
          (window as any).kakao.maps.event.removeListener(map, 'idle', idleListener);
        }
      };
    };

    const cleanup = checkServicesAndStart();
    
    return cleanup;
  }, [map, onAddressChange]);

  return (
    <div className="w-full bg-white p-4">
      {/* 헤더 영역 */}
      <div className="mb-3">
        <span className="text-sm px-2">지금 보고 계신 곳은</span>
      </div>
      
      {/* 주소 표시 영역 */}
      <div className="text-left">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">주소를 확인하는 중...</span>
          </div>
        ) : (
          <div 
            className="flex flex-row items-end gap-2 text-sm p-2 rounded-lg transition-all duration-150"
            onClick={() => {
              if (currentAddress.gu && currentAddress.dong && onAddressClick) {
                console.log('🖱️ 주소 클릭:', currentAddress.gu, currentAddress.dong);
                onAddressClick(currentAddress.gu, currentAddress.dong);
              }
            }}
          >
            <div
              className="inline-block text-2xl font-bold"
              // style={{ color: '#3288FF' }}
            >
              {currentAddress.gu} {currentAddress.dong}
            </div>
            <div>입니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}
