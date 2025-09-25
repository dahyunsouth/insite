'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import signGuData from '../../data/SignGuValue.json';
import signGuPolygonData from '../../data/SignGuPoligon.json';
import seoulPolygonData from '../../data/SeoulPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { 
  useMarketMode, 
  applyMarketModePolygonStyle, 
  createMarketModeLabelStyle,
  createMarketModeLabelContent, 
  handleMarketModeHover,
  updatePolygonsToMarketMode,
  KakaoPolygon,
  GuCountData
} from './MarketMode';
import MarketModeModal from './MarketModeModal';
import { 
  applyDefaultModePolygonStyle, 
  createDefaultModeLabelStyle,
  createDefaultModeLabelContent, 
  handleDefaultModeHover,
  updatePolygonsToDefaultMode
} from './DefaultMode';

// 타입 정의
interface KakaoOverlay {
  setMap: (map: any) => void;
}

interface SignGuPolygonProps {
  showMarketingArea?: boolean;
}

export default function SignGuPoligon({ showMarketingArea = false }: SignGuPolygonProps) {
  const { map } = useKakaoMapContext();
  const signGuPolygonsRef = useRef<KakaoPolygon[]>([]);
  const signGuLabelsRef = useRef<KakaoOverlay[]>([]);
  const eventListenersRef = useRef<(() => void)[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number, guName: string}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);
  const backgroundOverlayRef = useRef<KakaoOverlay | null>(null);
  
  // 상권 모드 훅 사용
  const { guCountData, isLoadingData, loadGuCountData } = useMarketMode();

  // 상권 모드 상태 변화 디버깅
  useEffect(() => {
    console.log('🔍 SignGuPoligon - showMarketingArea 상태 변화:', showMarketingArea);
  }, [showMarketingArea]);


  // showMarketingArea가 true일 때 데이터 로드
  useEffect(() => {
    console.log(`🎯 SignGuPoligon useEffect - showMarketingArea: ${showMarketingArea}, 데이터 개수: ${Object.keys(guCountData).length}`);
    if (showMarketingArea && Object.keys(guCountData).length === 0) {
      console.log('📞 자치구별 상권 데이터 로드 시작...');
      loadGuCountData();
    }
  }, [showMarketingArea, guCountData, loadGuCountData]);


  // 전역 이벤트 위임 설정
  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return; // 이미 설정됨

    const globalEventHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || !target.classList || !target.classList.contains('signgu-label')) return;

      const labelId = target.id;
      const polygonData = polygonMapRef.current.get(labelId);
      if (!polygonData) return;

      const { polygon, centerLat, centerLng, guName } = polygonData;

      if (e.type === 'mouseenter') {
        // 현재 상권 모드 상태를 실시간으로 확인
        const isMarketingMode = showMarketingArea;
        
        if (isMarketingMode) {
          handleMarketModeHover(polygon, guName, guCountData, true);
        } else {
          handleDefaultModeHover(polygon, guName, true);
        }
      } else if (e.type === 'mouseleave') {
        // 현재 상권 모드 상태를 실시간으로 확인
        const isMarketingMode = showMarketingArea;
        
        if (isMarketingMode) {
          handleMarketModeHover(polygon, guName, guCountData, false);
        } else {
          handleDefaultModeHover(polygon, guName, false);
        }
      } else if (e.type === 'click') {
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        map.setLevel(6);
      }
    };

    document.addEventListener('mouseenter', globalEventHandler, true);
    document.addEventListener('mouseleave', globalEventHandler, true);
    document.addEventListener('click', globalEventHandler, true);
    
    globalEventListenerRef.current = globalEventHandler;
  }, [map, showMarketingArea, guCountData]);

  // 상권 모드 상태 변화에 따른 폴리곤 업데이트
  useEffect(() => {
    if (!isShowingRef.current) return;

    // 상권 모드 변경 시 이벤트 핸들러 재설정
    if (globalEventListenerRef.current) {
      document.removeEventListener('mouseenter', globalEventListenerRef.current, true);
      document.removeEventListener('mouseleave', globalEventListenerRef.current, true);
      document.removeEventListener('click', globalEventListenerRef.current, true);
      globalEventListenerRef.current = null;
    }
    setupGlobalEventDelegation();

    if (showMarketingArea) {
      // 상권 모드 ON: 상권 개수에 따른 색상 적용
      if (Object.keys(guCountData).length > 0) {
        console.log('🎯 자치구 폴리곤을 상권 모드로 업데이트');
        updatePolygonsToMarketMode(signGuPolygonsRef.current, signGuLabelsRef.current, guCountData);
      }
    } else {
      // 상권 모드 OFF: 기본 상태로 복원
      console.log('🔵 자치구 폴리곤을 기본 모드로 복원');
      updatePolygonsToDefaultMode(signGuPolygonsRef.current, signGuLabelsRef.current);
    }
  }, [showMarketingArea, guCountData, setupGlobalEventDelegation]);

  // 구별 폴리곤과 라벨 숨김 함수 (고성능 최적화)
  const hideSignGuPolygons = useCallback(() => {
    if (!isShowingRef.current) return;

    // 즉시 상태 변경으로 중복 실행 방지
    isShowingRef.current = false;
    
    // 폴리곤 맵 정리
    polygonMapRef.current.clear();

    // 병렬 처리로 빠른 제거
    const polygons = signGuPolygonsRef.current;
    const labels = signGuLabelsRef.current;
    
    // 배치 처리로 한 번에 제거
    requestAnimationFrame(() => {
      polygons.forEach(polygon => polygon.setMap(null));
      labels.forEach(label => label.setMap(null));
    });
    
    // 참조 즉시 정리
    signGuPolygonsRef.current = [];
    signGuLabelsRef.current = [];
    eventListenersRef.current = [];

    // 배경 오버레이 제거
    if (backgroundOverlayRef.current) {
      backgroundOverlayRef.current.setMap(null);
      backgroundOverlayRef.current = null;
    }
  }, []);

  // 서울시 외부 영역 도넛 오버레이 표시
  const showBackgroundOverlay = useCallback(() => {
    if (!map || backgroundOverlayRef.current) return;

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const extendedSw = new (window.kakao.maps as any).LatLng(sw.getLat() - 1.0, sw.getLng() - 1.0);
    const extendedNe = new (window.kakao.maps as any).LatLng(ne.getLat() + 1.0, ne.getLng() + 1.0);

    const seoulBoundaryCoords: any[] = [];
    const seoulData = seoulPolygonData as any;
    if (seoulData && seoulData.geometries && seoulData.geometries.length > 0) {
      const firstGeometry = seoulData.geometries[0];
      if (firstGeometry.type === 'Polygon' && firstGeometry.coordinates && firstGeometry.coordinates[0]) {
        const coords = firstGeometry.coordinates[0];
        coords.forEach((coord: number[]) => {
          const { lat, lng } = tmToWgs84(coord[0], coord[1]);
          seoulBoundaryCoords.push(new (window.kakao.maps as any).LatLng(lat, lng));
        });
      }
    }

    if (seoulBoundaryCoords.length === 0) return;

    const outerPath = [
      extendedSw,
      new (window.kakao.maps as any).LatLng(extendedSw.getLat(), extendedNe.getLng()),
      extendedNe,
      new (window.kakao.maps as any).LatLng(extendedNe.getLat(), extendedSw.getLng()),
      extendedSw
    ];

    const donutPaths = [
      outerPath,
      seoulBoundaryCoords.slice().reverse()
    ];

    const backgroundPolygon = new (window.kakao.maps as any).Polygon({
      path: donutPaths,
      strokeWeight: 1,
      strokeColor: '#3288FF',
      fillColor: '#000000',
      fillOpacity: 0.1,
      clickable: false,
      zIndex: -1
    });

    backgroundPolygon.setMap(map);
    backgroundOverlayRef.current = backgroundPolygon as KakaoOverlay;
  }, [map]);

  // 구별 폴리곤과 라벨 표시 함수 (레벨 7~8)
  const showSignGuPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;

    console.log(`🎨 showSignGuPolygons 호출 - 상권모드: ${showMarketingArea}, 데이터개수: ${Object.keys(guCountData).length}`);

    // 상권 모드일 때 데이터가 로드되지 않았다면 로드 후 재시도
    if (showMarketingArea && Object.keys(guCountData).length === 0 && !isLoadingData) {
      console.log('🔄 상권 모드 활성화 상태에서 데이터 로드 필요');
      loadGuCountData().then(() => {
        // 데이터 로드 완료 후 다시 폴리곤 표시 시도
        if (!isShowingRef.current) {
          showSignGuPolygons();
        }
      });
      return;
    }

    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    isShowingRef.current = true;

    // 서울 외부 영역을 회색 처리하는 도넛 오버레이 표시
    showBackgroundOverlay();

    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const eventCleanups: (() => void)[] = [];
    
    // 현재 지도 레벨 확인
    const currentLevel = map.getLevel();
    
    // 레벨에 따른 글자 크기 및 개수 표시 여부 설정
    const fontSize = 14; // 구별은 크게
    const showCount = currentLevel >= 7 && currentLevel <= 8; // 레벨 7~8에서만 개수 표시

    // SignGuPoligon.json에서 폴리곤 데이터 가져오기
    const geometries = signGuPolygonData.geometries;
    if (!geometries || geometries.length === 0) return;

    // 각 구별로 폴리곤과 라벨 생성
    geometries.forEach((geometry: any, index: number) => {
      if (geometry.type === 'Polygon' && geometry.coordinates) {
        // 폴리곤 좌표 변환
        const polygonPaths: any[] = [];
        
        geometry.coordinates.forEach((ring: number[][]) => {
          const path = ring.map((coord: number[]) => {
            // TM 좌표계를 WGS84로 정확한 변환
            const { lat, lng } = tmToWgs84(coord[0], coord[1]);
            return new (window.kakao.maps as any).LatLng(lat, lng);
          });
          polygonPaths.push(path);
        });

        // 카카오맵 Polygon 생성 (최적화된 설정)
        const kakaoPolygon = new (window.kakao.maps as any).Polygon({
          path: polygonPaths,
          strokeWeight: 1,
          strokeColor: '#3288FF',
          strokeOpacity: 1,
          fillColor: '#3288FF',
          fillOpacity: 0, // 기본값에서 배경 투명
          clickable: false, // 클릭 비활성화로 성능 향상
          zIndex: 1 // 구별 폴리곤이 행정동보다 위에 표시
        }) as KakaoPolygon;

        // 지도에 폴리곤 표시
        kakaoPolygon.setMap(map);
        polygons.push(kakaoPolygon);

        // 해당하는 구 정보 찾기 (인덱스 기반으로 매칭)
        const district = signGuData.DATA[index];
        if (district) {
          const guName = district.signgu_nm;
          console.log(`🎨 폴리곤 생성: ${guName}, 상권모드=${showMarketingArea}`);

          // 모드에 따른 폴리곤 스타일 적용
          if (showMarketingArea) {
            applyMarketModePolygonStyle(kakaoPolygon, guName, guCountData);
          } else {
            applyDefaultModePolygonStyle(kakaoPolygon);
          }

          // 구 중심 좌표로 라벨 위치 설정 (정확한 TM->WGS84 변환)
          const { lat: centerLat, lng: centerLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);
          const position = new (window.kakao.maps as any).LatLng(centerLat, centerLng);

          // 구 이름 라벨 생성
          const currentLabelId = `signgu-label-${index}`;
          
          // 모드에 따른 라벨 콘텐츠 생성
          const content = showMarketingArea 
            ? createMarketModeLabelContent(guName, guCountData, currentLabelId, fontSize, showCount)
            : createDefaultModeLabelContent(guName, currentLabelId, fontSize);

          const customOverlay = new (window.kakao.maps as any).CustomOverlay({
            map: map,
            position: position,
            content: content,
            yAnchor: 0.5
          }) as KakaoOverlay;

          // 폴리곤 맵에 데이터 저장 (이벤트 위임용)
          polygonMapRef.current.set(currentLabelId, {
            polygon: kakaoPolygon,
            centerLat,
            centerLng,
            guName: district.signgu_nm
          });

          labels.push(customOverlay);
        }
      }
    });

    signGuPolygonsRef.current = polygons;
    signGuLabelsRef.current = labels;
    eventListenersRef.current = eventCleanups;
  }, [map, setupGlobalEventDelegation, showMarketingArea, guCountData, loadGuCountData, isLoadingData]);

  // 상권 데이터가 로드된 후 이미 표시된 폴리곤들을 업데이트
  useEffect(() => {
    if (showMarketingArea && Object.keys(guCountData).length > 0 && isShowingRef.current) {
      console.log('📊 상권 데이터 로드 완료 - 기존 폴리곤 업데이트');
      
      // 기존 폴리곤들을 제거하고 새로 생성
      hideSignGuPolygons();
      
      // 약간의 지연 후 다시 생성하여 상권 모드가 적용된 폴리곤 표시
      setTimeout(() => {
        const currentLevel = map.getLevel();
        if (currentLevel >= 7 && currentLevel <= 8) {
          showSignGuPolygons();
        }
      }, 50);
    }
  }, [guCountData, showMarketingArea, map, hideSignGuPolygons, showSignGuPolygons]);

  useEffect(() => {
    if (!map || !window.kakao) return;

    let debounceTimer: NodeJS.Timeout;

    // 즉시 차단 시스템 - 레벨 7~8 범위를 벗어나면 바로 데이터 차단
    const zoomChangedListener = () => {
      const currentLevel = map.getLevel();
      console.log(`🔍 줌 변경 감지: 레벨 ${currentLevel}, 상권모드: ${showMarketingArea}, 현재표시: ${isShowingRef.current}`);
      
      // 레벨 7~8 범위를 벗어나면 즉시 강제 차단 (렌더링 전에 차단)
      if (currentLevel < 7 || currentLevel > 8) {
        if (isShowingRef.current) {
          console.log(`❌ 레벨 ${currentLevel} - 폴리곤 숨김`);
          // 즉시 모든 폴리곤 제거 (애니메이션 없이)
          signGuPolygonsRef.current.forEach(polygon => polygon.setMap(null));
          signGuLabelsRef.current.forEach(label => label.setMap(null));
          signGuPolygonsRef.current = [];
          signGuLabelsRef.current = [];
          polygonMapRef.current.clear();
          isShowingRef.current = false;
        }
        clearTimeout(debounceTimer);
        return;
      }
      
      // 레벨 7~8 범위에 있을 때만 표시
      if ((currentLevel >= 7 && currentLevel <= 8) && !isShowingRef.current) {
        console.log(`✅ 레벨 ${currentLevel} - 폴리곤 표시 준비, 상권모드: ${showMarketingArea}`);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          showSignGuPolygons();
        }, 50);
      }
    };

    // 이벤트 리스너 등록
    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', zoomChangedListener);

    // 초기 로드 시에도 엄격한 레벨 7~8 확인
    const initialLevel = map.getLevel();
    if (initialLevel >= 7 && initialLevel <= 8) {
      showSignGuPolygons();
    } else {
      // 레벨 7~8이 아니면 무조건 숨김
      hideSignGuPolygons();
    }

    // cleanup 함수
    return () => {
      clearTimeout(debounceTimer);
      hideSignGuPolygons();
      
      // 전역 이벤트 리스너 정리
      if (globalEventListenerRef.current) {
        document.removeEventListener('mouseenter', globalEventListenerRef.current, true);
        document.removeEventListener('mouseleave', globalEventListenerRef.current, true);
        document.removeEventListener('click', globalEventListenerRef.current, true);
        globalEventListenerRef.current = null;
      }
    };
  }, [map, hideSignGuPolygons, showSignGuPolygons, showMarketingArea]);

  return (
    <>
      {/* 상권 모드 로딩 모달 */}
      <MarketModeModal isLoading={showMarketingArea && isLoadingData} />
    </>
  );
}
