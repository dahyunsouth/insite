'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import seoulDistricts from '../../data/seoulDistricts.json';

// 카카오맵 타입은 이미 다른 파일에서 정의되어 있으므로 별도 선언 불필요

export default function ZoomBlock() {
  const { map } = useKakaoMapContext();
  const [showZoomLimitMessage, setShowZoomLimitMessage] = useState(false);
  const seoulBoundariesRef = useRef<unknown[]>([]);

  // 서울시 경계선 표시 함수
  const showSeoulBoundaries = useCallback(() => {
    if (!map || !window.kakao || seoulBoundariesRef.current.length > 0) return;

    const polygons: unknown[] = [];

    seoulDistricts.features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        // GeoJSON 좌표를 카카오맵 좌표로 변환 (매우 미세하게 위로 조정)
        const coordinates = feature.geometry.coordinates[0].map(([lng, lat]) => 
          new (window.kakao.maps as any).LatLng(lat + 0.0025, lng - 0.001) // 위도에 0.00005도 추가 (약 5.5미터, 매우 미세한 조정)
        );

        // 폴리곤 생성
        const polygon = new (window.kakao.maps as any).Polygon({
          path: coordinates,
          strokeWeight: 2,
          strokeColor: '#3288FF',
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          fillColor: '#3288FF',
          fillOpacity: 0.1
        });

        // 지도에 폴리곤 표시
        polygon.setMap(map);
        polygons.push(polygon);
      }
    });

    seoulBoundariesRef.current = polygons;
  }, [map]);

  // 서울시 경계선 숨김 함수
  const hideSeoulBoundaries = useCallback(() => {
    seoulBoundariesRef.current.forEach((polygon: any) => {
      polygon.setMap(null);
    });
    seoulBoundariesRef.current = [];
  }, []);


  useEffect(() => {
    if (!map || !window.kakao) return;

    let isBlocking = false; // 중복 실행 방지

    // 지도 줌 레벨 변경 이벤트 리스너 등록
    const zoomChangedListener = () => {
      if (isBlocking) return; // 중복 실행 방지
      
      const currentLevel = map.getLevel();
      
      // 레벨 9일 때 서울시 경계선 표시 및 중심 좌표 설정
      if (currentLevel >= 9) {
        showSeoulBoundaries();
        
        // 화면 정중앙을 지정된 좌표로 설정
        const seoulCenter = new (window.kakao.maps as any).LatLng(37.5662952, 126.9779451);
        map.setCenter(seoulCenter);
      } else {
        // 레벨 9 미만일 때 경계선 숨김
        hideSeoulBoundaries();
      }
      
      // 줌 레벨이 10 이상일 때 (더 축소되었을 때) 제한 걸기
      if (currentLevel >= 10) {
        isBlocking = true; // 블로킹 시작
        
        // 레벨 9로 강제 설정 (더 이상 축소 불가)
        map.setLevel(9, { animate: false });
        
        // 제한 메시지 표시
        setShowZoomLimitMessage(true);
        
        // 3초 후 메시지 숨김 및 블로킹 해제
        setTimeout(() => {
          setShowZoomLimitMessage(false);
          isBlocking = false; // 블로킹 해제
        }, 3000);
      }
    };

    // 마우스 휠 이벤트를 직접 제어
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      const wheelHandler = (e: WheelEvent) => {
        const currentLevel = map.getLevel();
        
        // 축소 방향 휠 (deltaY > 0)이고 현재 레벨이 9 이상일 때 이벤트 차단
        if (e.deltaY > 0 && currentLevel >= 9) {
          e.preventDefault();
          e.stopPropagation();
          
          // 제한 메시지 표시
          setShowZoomLimitMessage(true);
          
          // 3초 후 메시지 숨김
          setTimeout(() => {
            setShowZoomLimitMessage(false);
          }, 3000);
          
          return false;
        }
      };
      
      // 휠 이벤트 등록 (capture 단계에서 차단)
      mapContainer.addEventListener('wheel', wheelHandler, { capture: true, passive: false });
      
      // cleanup에서 휠 이벤트 제거 및 경계선 정리
      const cleanup = () => {
        mapContainer.removeEventListener('wheel', wheelHandler, { capture: true });
        hideSeoulBoundaries();
      };
      
      // 이벤트 리스너 등록
      window.kakao.maps.event.addListener(map, 'zoom_changed', zoomChangedListener);

      return cleanup;
    }

    // 이벤트 리스너 등록 (mapContainer가 없는 경우)
    window.kakao.maps.event.addListener(map, 'zoom_changed', zoomChangedListener);

    // cleanup 함수
    return () => {
      // 카카오맵 API에서는 자동으로 이벤트 리스너가 정리됩니다
      hideSeoulBoundaries();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // 메시지가 표시되지 않을 때는 null 반환
  if (!showZoomLimitMessage) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-black/80 rounded-lg px-6 py-4 text-center">
        <p className="text-white text-sm leading-relaxed">
          더 이상 축소가 불가능합니다.
        </p>
        <p className="text-white text-sm leading-relaxed">
          확대해서 이용해주세요.
        </p>
      </div>
    </div>
  );
}
