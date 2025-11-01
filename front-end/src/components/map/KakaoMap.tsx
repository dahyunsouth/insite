'use client';

import { useEffect, useRef, createContext, useContext, ReactNode, useState } from 'react';
import Notification from './Notification';
import { useNotification } from './useNotification';
import LoadView from './LoadView';
import CafeSearch from './CafeSearch';
import ZoomBlock from './ZoomBlock';
import SignGuPoligon from './SignGuPoligon';
import AdstrdPoligon from './AdstrdPoligon';
import TradeAreaPoligon from './TradeAreaPoligon';
import DetailModal from '../organisms/Detail/DetailModal';
import tradeAreaData from '../../data/TradeAreaValue.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';

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
export function KakaoMapProvider({ children, showNotification, cafeActive = false }: { children: ReactNode; showNotification: (message: string) => void; cafeActive?: boolean }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // 성능 모니터링 시스템
  const performanceMonitor = {
    startTime: 0,
    frameCount: 0,
    jankCount: 0,
    label: '',

    start: (label: string) => {
      performanceMonitor.label = label;
      performanceMonitor.startTime = performance.now();
      performanceMonitor.frameCount = 0;
      performanceMonitor.jankCount = 0;
      console.log(`🚀 [${label}] 성능 측정 시작`);
    },

    measureFrame: (lastTime: number) => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;
      performanceMonitor.frameCount++;
      if (frameTime > 16.67) { // 60FPS 기준 16.67ms 초과 시 Jank
        performanceMonitor.jankCount++;
      }
      return currentTime;
    },

    stop: () => {
      const totalTime = performance.now() - performanceMonitor.startTime;
      if (totalTime <= 0 || performanceMonitor.frameCount <= 0) return;

      const fps = (performanceMonitor.frameCount / (totalTime / 1000));
      const jankPercentage = (performanceMonitor.jankCount / performanceMonitor.frameCount) * 100;
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

      console.log(`[${performanceMonitor.label} 성능 측정 결과]`);
      console.log(`- 총 소요 시간: ${totalTime.toFixed(2)}ms`);
      console.log(`- 평균 FPS: ${fps.toFixed(1)}`);
      console.log(`- 버벅임 (Jank): ${performanceMonitor.jankCount}회 (${jankPercentage.toFixed(1)}%)`);
      console.log(`- 메모리 사용량: ${memoryUsage.toFixed(1)}MB`);
      console.log('----------------------------------------');
    }
  };

  const setMapType = (mapType: 'roadmap' | 'skyview') => {
    if (!map) return;
    
    const mapTypeId = mapType === 'skyview' 
      ? (window as any).kakao.maps.MapTypeId.HYBRID 
      : (window as any).kakao.maps.MapTypeId.ROADMAP;
    
    map.setMapTypeId(mapTypeId);
  };



  const zoomIn = () => {
    if (!map) return;
    window.dispatchEvent(new CustomEvent('hideAllLabels')); // 라벨 숨기기 이벤트 발생

    const currentLevel = map.getLevel();

    performanceMonitor.start('Zoom In 애니메이션');
    let lastTime = performance.now();
    const measureFrames = () => {
      lastTime = performanceMonitor.measureFrame(lastTime);
      if (performance.now() - performanceMonitor.startTime < 500) { // 500ms 애니메이션 시간
        requestAnimationFrame(measureFrames);
      } else {
        performanceMonitor.stop();
      }
    };
    requestAnimationFrame(measureFrames);

    map.setLevel(currentLevel - 1, { 
      animate: {
        duration: 500,
      }
    });
  };

  const zoomOut = () => {
    if (!map) return;
    window.dispatchEvent(new CustomEvent('hideAllLabels')); // 라벨 숨기기 이벤트 발생

    const currentLevel = map.getLevel();

    performanceMonitor.start('Zoom Out 애니메이션');
    let lastTime = performance.now();
    const measureFrames = () => {
      lastTime = performanceMonitor.measureFrame(lastTime);
      if (performance.now() - performanceMonitor.startTime < 500) { // 500ms 애니메이션 시간
        requestAnimationFrame(measureFrames);
      } else {
        performanceMonitor.stop();
      }
    };
    requestAnimationFrame(measureFrames);
    
    map.setLevel(currentLevel + 1, { 
      animate: {
        duration: 500,
      }
    });
  };

  const getZoomLevel = () => {
    if (!map) return 3;
    return map.getLevel();
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        if (!mapContainer.current) return;

        // 초기 중심: 성수동카페거리 좌표로 설정
        // Fallback 또한 성수동카페거리의 TM → WGS84 변환값을 사용
        const SEONGSU_FALLBACK = tmToWgs84(204716, 449234); // TradeAreaValue.json 기준
        let initialCenter = new (window as any).kakao.maps.LatLng(SEONGSU_FALLBACK.lat, SEONGSU_FALLBACK.lng);
        try {
          const seongsu = (tradeAreaData as any).DATA.find((a: any) => a.trdar_cd_nm === '성수동카페거리');
          if (seongsu) {
            const { lat, lng } = tmToWgs84(seongsu.xcnts_value, seongsu.ydnts_value);
            initialCenter = new (window as any).kakao.maps.LatLng(lat, lng);
          }
        } catch {}

        const options = {
          center: initialCenter,
          level: 4
        };

        const mapInstance = new (window as any).kakao.maps.Map(mapContainer.current, options);
        
        // 지도가 확대 또는 축소되면 이벤트를 등록합니다
        (window as any).kakao.maps.event.addListener(mapInstance, 'zoom_changed', function() {
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

  // focusTradeArea 이벤트 리스너 등록 (지도가 준비된 후)
  useEffect(() => {
    if (!map) return;

    const handleFocusTradeArea = (event: CustomEvent) => {
      const { code, name, coordinates } = event.detail;
      console.log('focusTradeArea 이벤트 수신:', { code, name, coordinates });
      
      if (map && coordinates) {
        // 지도 중심을 해당 상권 좌표로 이동
        const moveLatLon = new (window as any).kakao.maps.LatLng(coordinates.lat, coordinates.lng);
        map.setCenter(moveLatLon);
        
        // 지도 레벨을 적절하게 설정 (상권 상세 보기)
        map.setLevel(4);
        
        console.log('지도 중심 이동 완료:', coordinates);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('focusTradeArea', handleFocusTradeArea as EventListener);

    return () => {
      // 이벤트 리스너 제거
      window.removeEventListener('focusTradeArea', handleFocusTradeArea as EventListener);
    };
  }, [map]);

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
export default function FullScreenKakaoMap({ 
  children, 
  cafeActive = false, 
  showMarketingArea = false,
  onTradeAreaSelect,
  onShowMarketList
}: { 
  children?: ReactNode; 
  cafeActive?: boolean; 
  showMarketingArea?: boolean;
  onTradeAreaSelect?: (tradeAreaName: string | null, tradeAreaCode: string | null) => void;
  onShowMarketList?: (district: string, dong: string) => void;
}) {
  const { notification, showNotification, hideNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTradeArea, setSelectedTradeArea] = useState<{
    name: string | null;
    code: string | null;
  }>({ name: null, code: null });

  console.log('FullScreenKakaoMap 렌더링:', { cafeActive });

  // 상권 선택 핸들러
  const handleTradeAreaSelect = (tradeAreaName: string | null, tradeAreaCode: string | null) => {
    setSelectedTradeArea({ name: tradeAreaName, code: tradeAreaCode });
    onTradeAreaSelect?.(tradeAreaName, tradeAreaCode);
  };

  // 안내바 클릭 핸들러
  const handleNotificationClick = () => {
    if (selectedTradeArea.name) {
      setIsModalOpen(true);
      hideNotification();
    }
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <KakaoMapProvider showNotification={showNotification} cafeActive={cafeActive}>
      {/* 상권별 폴리곤 표시 컴포넌트 (레벨 1~5) */}
      <TradeAreaPoligon onTradeAreaSelect={handleTradeAreaSelect} onShowMarketList={onShowMarketList} />
      
      {/* 로드뷰 컴포넌트 */}
      <LoadView 
        isActive={false} 
        onToggle={() => {}} 
      />
      
      {/* 카페 검색 컴포넌트 */}
      <CafeSearch isActive={cafeActive} />
      
      {/* 줌 제한 컴포넌트 */}
      <ZoomBlock />
      
      {/* 구별 폴리곤 표시 컴포넌트 (레벨 7~8) */}
      <SignGuPoligon showMarketingArea={showMarketingArea} />
      
      {/* 행정동별 폴리곤 표시 컴포넌트 (레벨 6) */}
      <AdstrdPoligon showMarketingArea={showMarketingArea} />
      
      {/* 자식 컴포넌트들 */}
      {children}
      
      {/* 알림 컴포넌트 */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        onClick={handleNotificationClick}
      />

      {/* 상권 상세 모달 */}
      <DetailModal
        open={isModalOpen}
        onClose={handleModalClose}
        title={selectedTradeArea.name ? `${selectedTradeArea.name} 상권 분석` : undefined}
        subtitle="상권 상세 정보를 확인하세요"
        trdarCode={selectedTradeArea.code}
      />
    </KakaoMapProvider>
  );
}