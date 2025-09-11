'use client';

import { useEffect, useRef, createContext, useContext, ReactNode, useState } from 'react';
import { DefaultCircleWithText } from './CircleWithText';
import Notification from './Notification';
import { useNotification } from './useNotification';

declare global {
  interface Window {
    kakao: any;
  }
}

// KakaoMap Context 생성
interface KakaoMapContextType {
  map: any;
  setMapType: (mapType: 'roadmap' | 'skyview') => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getZoomLevel: () => number;
  showNotification: (message: string) => void;
}

const KakaoMapContext = createContext<KakaoMapContextType | null>(null);

// KakaoMap Provider 컴포넌트
export function KakaoMapProvider({ children, showNotification }: { children: ReactNode; showNotification: (message: string) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  const setMapType = (mapType: 'roadmap' | 'skyview') => {
    if (!map) return;
    
    const mapTypeId = mapType === 'skyview' 
      ? window.kakao.maps.MapTypeId.HYBRID 
      : window.kakao.maps.MapTypeId.ROADMAP;
    
    map.setMapTypeId(mapTypeId);
  };

  const zoomIn = () => {
    if (!map) return;
    const currentLevel = map.getLevel();
    // 부드러운 애니메이션과 함께 줌 인 (지속시간 500ms, 이징 적용)
    map.setLevel(currentLevel - 1, { 
      animate: true,
      duration: 500,
      easing: 'easeOutCubic'
    });
  };

  const zoomOut = () => {
    if (!map) return;
    const currentLevel = map.getLevel();
    // 부드러운 애니메이션과 함께 줌 아웃 (지속시간 500ms, 이징 적용)
    map.setLevel(currentLevel + 1, { 
      animate: true,
      duration: 500,
      easing: 'easeOutCubic'
    });
  };

  const getZoomLevel = () => {
    if (!map) return 3;
    return map.getLevel();
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(37.501309, 127.039599),
          level: 3
        };

        const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
        
        // 지도가 확대 또는 축소되면 이벤트를 등록합니다
        window.kakao.maps.event.addListener(mapInstance, 'zoom_changed', function() {
          // 지도의 현재 레벨을 얻어옵니다
          const level = mapInstance.getLevel();
          // 필요시 줌 레벨 변경에 따른 추가 로직을 여기에 구현
          // console.log('현재 지도 레벨은', level, '입니다');
        });
        
        setMap(mapInstance);
      });
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <KakaoMapContext.Provider value={{ map, setMapType, zoomIn, zoomOut, getZoomLevel, showNotification }}>
      <div 
        id="map"
        ref={mapContainer}
        className="fixed inset-0 w-screen h-screen z-0"
      />
      {children}
    </KakaoMapContext.Provider>
  );
}

// useKakaoMap 훅
export function useKakaoMap() {
  const context = useContext(KakaoMapContext);
  return context?.map || null;
}

// useKakaoMapContext 훅 (전체 컨텍스트 접근용)
export function useKakaoMapContext() {
  const context = useContext(KakaoMapContext);
  if (!context) {
    throw new Error('useKakaoMapContext must be used within a KakaoMapProvider');
  }
  return context;
}

// 기존 컴포넌트는 Provider로 감싸서 사용
export default function FullScreenKakaoMap({ children }: { children?: ReactNode }) {
  const { notification, showNotification, hideNotification } = useNotification();

  return (
    <KakaoMapProvider showNotification={showNotification}>
      {/* 기본 원과 텍스트 예제 */}
      <DefaultCircleWithText />
      
      {/* 자식 컴포넌트들 */}
      {children}
      
      {/* 알림 컴포넌트 */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </KakaoMapProvider>
  );
}