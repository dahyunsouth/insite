'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import adstrdAreaData from '../../data/AdstrdAreaValue.json';
import adstrdNameData from '../../data/AdstrdValue.json';
import seoulPolygonData from '../../data/SeoulPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';

// 타입 정의
interface KakaoPolygon {
  setMap: (map: any) => void;
  setOptions: (options: any) => void;
  getOptions?: () => any;
}

interface KakaoOverlay {
  setMap: (map: any) => void;
}


export default function AdstrdCircle() {
  const { map } = useKakaoMapContext();
  const adstrdPolygonsRef = useRef<KakaoPolygon[]>([]);
  const adstrdLabelsRef = useRef<KakaoOverlay[]>([]);
  const eventListenersRef = useRef<(() => void)[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);
  const backgroundOverlayRef = useRef<KakaoOverlay | null>(null);

  // 좌표를 이용해서 가장 가까운 행정동 이름 찾기
  const findNearestAdstrdName = useCallback((centerLat: number, centerLng: number): string => {
    const nameData = adstrdNameData as any;
    if (!nameData.DATA || !Array.isArray(nameData.DATA)) {
      return '알 수 없음';
    }

    let minDistance = Infinity;
    let nearestName = '알 수 없음';

    nameData.DATA.forEach((district: any) => {
      // TM 좌표를 위경도로 정확한 변환
      const { lat: districtLat, lng: districtLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);

      // 거리 계산 (유클리드 거리)
      const distance = Math.sqrt(
        Math.pow(centerLat - districtLat, 2) + Math.pow(centerLng - districtLng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestName = district.adstrd_nm || '알 수 없음';
      }
    });

    return nearestName;
  }, []);

  // 서울시 외부 영역 오버레이 표시 함수 (SeoulPoligon.json 사용)
  const showBackgroundOverlay = useCallback(() => {
    if (!map || backgroundOverlayRef.current) return;

    // 지도 전체를 덮는 큰 사각형 생성
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // 지도 영역보다 훨씬 넓게 설정
    const extendedSw = new (window.kakao.maps as any).LatLng(
      sw.getLat() - 1.0, 
      sw.getLng() - 1.0
    );
    const extendedNe = new (window.kakao.maps as any).LatLng(
      ne.getLat() + 1.0, 
      ne.getLng() + 1.0
    );

    // SeoulPoligon.json에서 서울시 정확한 경계 좌표 추출
    const seoulBoundaryCoords: any[] = [];
    
    // GeometryCollection 구조에서 서울시 경계 좌표를 위경도로 변환
    const seoulData = seoulPolygonData as any;
    if (seoulData && seoulData.geometries && seoulData.geometries.length > 0) {
      const firstGeometry = seoulData.geometries[0];
      if (firstGeometry.type === 'Polygon' && firstGeometry.coordinates && firstGeometry.coordinates[0]) {
        const coords = firstGeometry.coordinates[0];
        coords.forEach((coord: number[]) => {
          // TM 좌표를 위경도로 정확한 변환
          const { lat, lng } = tmToWgs84(coord[0], coord[1]);
          seoulBoundaryCoords.push(new (window.kakao.maps as any).LatLng(lat, lng));
        });
      }
    }

    // 외부 사각형 좌표 (시계방향)
    const outerPath = [
      extendedSw,
      new (window.kakao.maps as any).LatLng(extendedSw.getLat(), extendedNe.getLng()),
      extendedNe,
      new (window.kakao.maps as any).LatLng(extendedNe.getLat(), extendedSw.getLng()),
      extendedSw
    ];

    // 서울시 경계 좌표가 있는지 확인
    if (seoulBoundaryCoords.length === 0) {
      console.warn('서울시 경계 좌표를 찾을 수 없습니다.');
      return;
    }

    console.log('서울시 경계 좌표 개수:', seoulBoundaryCoords.length);

    // 카카오맵 도넛 폴리곤: 외부 사각형에서 서울시 경계를 홀로 뚫기
    const donutPaths = [
      outerPath, // 외부 사각형 (시계방향)
      seoulBoundaryCoords.slice().reverse() // 서울시 경계 (반시계방향으로 홀 생성)
    ];

    const backgroundPolygon = new (window.kakao.maps as any).Polygon({
      path: donutPaths,
      strokeWeight: 1,
      strokeColor: '#3288FF', // 디버깅용 빨간 선
      fillColor: '#000000',
      fillOpacity: 0.1,
      clickable: false,
      zIndex: -1 // 행정동 폴리곤보다 뒤에 표시
    });

    backgroundPolygon.setMap(map);
    backgroundOverlayRef.current = backgroundPolygon as KakaoOverlay;
    console.log('도넛 폴리곤 생성 완료');
  }, [map]);

  // 배경 오버레이 숨김 함수
  const hideBackgroundOverlay = useCallback(() => {
    if (backgroundOverlayRef.current) {
      backgroundOverlayRef.current.setMap(null);
      backgroundOverlayRef.current = null;
    }
  }, []);

  // 전역 이벤트 위임 설정
  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return; // 이미 설정됨

    const globalEventHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || !target.classList || !target.classList.contains('adstrd-label')) return;

      const labelId = target.id;
      const polygonData = polygonMapRef.current.get(labelId);
      if (!polygonData) return;

      const { polygon, centerLat, centerLng } = polygonData;

      if (e.type === 'mouseenter') {
        polygon.setOptions({
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeOpacity: 1
        });
      } else if (e.type === 'mouseleave') {
        polygon.setOptions({
          fillOpacity: 0,
          strokeWeight: 1,
          strokeOpacity: 0.8
        });
      } else if (e.type === 'click') {
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        map.setLevel(5);
      }
    };

    document.addEventListener('mouseenter', globalEventHandler, true);
    document.addEventListener('mouseleave', globalEventHandler, true);
    document.addEventListener('click', globalEventHandler, true);
    
    globalEventListenerRef.current = globalEventHandler;
  }, [map]);

  // 행정동별 폴리곤과 라벨 숨김 함수 (고성능 최적화)
  const hideAdstrdPolygons = useCallback(() => {
    if (!isShowingRef.current) return;

    // 즉시 상태 변경으로 중복 실행 방지
    isShowingRef.current = false;
    
    // 배경 오버레이 숨김
    hideBackgroundOverlay();
    
    // 폴리곤 맵 정리
    polygonMapRef.current.clear();

    // 병렬 처리로 빠른 제거
    const polygons = adstrdPolygonsRef.current;
    const labels = adstrdLabelsRef.current;
    
    // 배치 처리로 한 번에 제거
    requestAnimationFrame(() => {
      polygons.forEach(polygon => polygon.setMap(null));
      labels.forEach(label => label.setMap(null));
    });
    
    // 참조 즉시 정리
    adstrdPolygonsRef.current = [];
    adstrdLabelsRef.current = [];
    eventListenersRef.current = [];
  }, [hideBackgroundOverlay]);

  // 행정동별 폴리곤과 라벨 표시 함수 (레벨 6)
  const showAdstrdPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;

    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    // 배경 오버레이 표시
    showBackgroundOverlay();
    
    isShowingRef.current = true;

    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const eventCleanups: (() => void)[] = [];
    
    // 레벨 6일 때 글자 크기 설정
    const fontSize = 10; // 행정동은 더 작게

    // 폴리곤 데이터 처리 - GeometryCollection 형태의 데이터
    const geometryCollection = adstrdAreaData as any;
    if (geometryCollection.geometries && Array.isArray(geometryCollection.geometries)) {
      geometryCollection.geometries.forEach((polygon: any, index: number) => {
      if (polygon.type === 'Polygon' && polygon.coordinates && polygon.coordinates.length > 0) {
        // 좌표 변환: TM 좌표계를 WGS84로 변환
        const coordinates = polygon.coordinates[0].map((coord: number[]) => {
          // TM 좌표를 위경도로 정확한 변환
          const { lat, lng } = tmToWgs84(coord[0], coord[1]);
          return new (window.kakao.maps as any).LatLng(lat, lng);
        });

        // 카카오맵 Polygon API를 사용하여 폴리곤 생성 (최적화된 설정)
        const kakaoPolygon = new (window.kakao.maps as any).Polygon({
          path: coordinates,
          strokeWeight: 1,
          strokeColor: '#3288FF',
          strokeOpacity: 0.6, // 투명도 낮춰서 렌더링 부하 감소
          fillColor: '#3288FF',
          fillOpacity: 0,
          clickable: false, // 클릭 비활성화로 성능 향상
          zIndex: 0 // z-index 낮춰서 렌더링 우선순위 감소
        }) as KakaoPolygon;

        // 지도에 폴리곤 표시
        kakaoPolygon.setMap(map);
        polygons.push(kakaoPolygon);


        // 폴리곤의 중심점 계산 (라벨 위치용)
        let centerLat = 0;
        let centerLng = 0;
        coordinates.forEach((coord: any) => {
          centerLat += coord.getLat();
          centerLng += coord.getLng();
        });
        centerLat = centerLat / coordinates.length;
        centerLng = centerLng / coordinates.length;
        const center = new (window.kakao.maps as any).LatLng(centerLat, centerLng);

        // 행정동 이름 라벨 생성 (좌표 기반으로 실제 이름 찾기)
        const dongName = findNearestAdstrdName(centerLat, centerLng);
        const currentLabelId = `adstrd-label-${index}`;
        const content = `<div id="${currentLabelId}" class="adstrd-label" style="
          padding: 4px 8px;
          font-size: ${fontSize}px;
          font-weight: bold;
          color: #000000;
          text-align: center;
          white-space: nowrap;
          pointer-events: auto;
          cursor: pointer;
          text-shadow: none;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 5px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        " onmouseover="this.style.backgroundColor='rgba(50, 136, 255, 0.8)'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1.1)'" 
           onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.9)'; this.style.color='#000000'; this.style.textShadow='none'; this.style.transform='scale(1)'"
        >${dongName}</div>`;

        const customOverlay = new (window.kakao.maps as any).CustomOverlay({
          map: map,
          position: center,
          content: content,
          yAnchor: 0.5
        }) as KakaoOverlay;

        // 폴리곤 맵에 데이터 저장 (이벤트 위임용)
        polygonMapRef.current.set(currentLabelId, {
          polygon: kakaoPolygon,
          centerLat,
          centerLng
        });

        labels.push(customOverlay);
      }
      });
    }

    adstrdPolygonsRef.current = polygons;
    adstrdLabelsRef.current = labels;
    eventListenersRef.current = eventCleanups;
  }, [map, findNearestAdstrdName, setupGlobalEventDelegation, showBackgroundOverlay]);

  useEffect(() => {
    if (!map || !window.kakao) return;

    let debounceTimer: NodeJS.Timeout;

    // 즉시 차단 시스템 - 레벨 6 초과 시 바로 데이터 차단
    const zoomChangedListener = () => {
      const currentLevel = map.getLevel();
      
      // 레벨 6 초과 시 즉시 강제 차단 (렌더링 전에 차단)
      if (currentLevel > 6) {
        if (isShowingRef.current) {
          // 배경 오버레이 즉시 제거
          hideBackgroundOverlay();
          // 즉시 모든 폴리곤 제거 (애니메이션 없이)
          adstrdPolygonsRef.current.forEach(polygon => polygon.setMap(null));
          adstrdLabelsRef.current.forEach(label => label.setMap(null));
          adstrdPolygonsRef.current = [];
          adstrdLabelsRef.current = [];
          polygonMapRef.current.clear();
          isShowingRef.current = false;
        }
        clearTimeout(debounceTimer);
        return;
      }
      
      // 레벨 6 미만 시에도 즉시 숨김
      if (currentLevel < 6 && isShowingRef.current) {
        hideAdstrdPolygons();
        clearTimeout(debounceTimer);
        return;
      }
      
      // 정확히 레벨 6일 때만 표시
      if (currentLevel === 6 && !isShowingRef.current) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          showAdstrdPolygons();
        }, 50);
      }
    };

    // 이벤트 리스너 등록
    window.kakao.maps.event.addListener(map, 'zoom_changed', zoomChangedListener);

    // 초기 로드 시에도 엄격한 레벨 6 확인
    const initialLevel = map.getLevel();
    if (initialLevel === 6) {
      showAdstrdPolygons();
    } else {
      // 레벨 6이 아니면 무조건 숨김 (5 이하, 7 이상 모두 포함)
      hideAdstrdPolygons();
    }

    // cleanup 함수
    return () => {
      clearTimeout(debounceTimer);
      hideAdstrdPolygons();
      hideBackgroundOverlay();
      
      // 전역 이벤트 리스너 정리
      if (globalEventListenerRef.current) {
        document.removeEventListener('mouseenter', globalEventListenerRef.current, true);
        document.removeEventListener('mouseleave', globalEventListenerRef.current, true);
        document.removeEventListener('click', globalEventListenerRef.current, true);
        globalEventListenerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null; // UI 요소 없음
}
