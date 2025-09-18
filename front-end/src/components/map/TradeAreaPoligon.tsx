'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import tradeAreaData from '../../data/TradeAreaValue.json';
import tradeAreaPolygonData from '../../data/TradeAreaPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { isPointInPolygon, convertKakaoLatLngsToPoints, Point, PolygonPath } from '../../utils/pointInPolygon';

// 타입 정의
interface KakaoPolygon {
  setMap: (map: any) => void;
  setOptions: (options: any) => void;
  getOptions?: () => any;
}

interface KakaoOverlay {
  setMap: (map: any) => void;
}

export default function TradeAreaPoligon() {
  const { map } = useKakaoMapContext();
  const tradeAreaPolygonsRef = useRef<KakaoPolygon[]>([]);
  const tradeAreaLabelsRef = useRef<KakaoOverlay[]>([]);
  const eventListenersRef = useRef<(() => void)[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number, polygonPaths: PolygonPath[][]}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);

  // 전역 이벤트 위임 설정
  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return; // 이미 설정됨

    const globalEventHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // 더 안전한 클래스 확인 방법
      const hasTradeAreaClass = target.className && 
        (typeof target.className === 'string' ? 
         target.className.includes('tradearea-label') : 
         (target.className as any).baseVal && (target.className as any).baseVal.includes('tradearea-label'));
      
      if (!target || !hasTradeAreaClass) {
        return;
      }

      const labelId = target.id;
      const polygonData = polygonMapRef.current.get(labelId);
      
      if (!polygonData) return;

      const { polygon, centerLat, centerLng } = polygonData;

      if (e.type === 'mouseenter') {
        // 폴리곤 호버 효과
        polygon.setOptions({
          fillColor: '#3288FF',
          fillOpacity: 0.3,
          strokeWeight: 3,
          strokeColor: '#3288FF',
          strokeOpacity: 1,
          zIndex: 1000
        });
        
        // 라벨도 최상위로 올리기 (이미 onmouseover 이벤트에서 처리되지만 추가 보장)
        if (target.style) {
          target.style.zIndex = '9999';
          target.style.transform = 'scale(1.05)';
          target.style.boxShadow = '0 4px 12px rgba(50, 136, 255, 0.4)';
        }
      } else if (e.type === 'mouseleave') {
        // 폴리곤 호버 효과 제거
        polygon.setOptions({
          fillColor: '#3288FF',
          fillOpacity: 0,
          strokeWeight: 1,
          strokeColor: '#3288FF',
          strokeOpacity: 0.8,
          zIndex: 2
        });
        
        // 라벨 원래 상태로 복원
        if (target.style) {
          target.style.zIndex = '100';
          target.style.transform = 'scale(1)';
          target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      } else if (e.type === 'click') {
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        map.setLevel(4);
      }
    };

    document.addEventListener('mouseenter', globalEventHandler, true);
    document.addEventListener('mouseleave', globalEventHandler, true);
    document.addEventListener('click', globalEventHandler, true);
    
    globalEventListenerRef.current = globalEventHandler;
  }, [map]);

  // 상권별 폴리곤과 라벨 숨김 함수 (고성능 최적화)
  const hideTradeAreaPolygons = useCallback(() => {
    if (!isShowingRef.current) return;

    // 즉시 상태 변경으로 중복 실행 방지
    isShowingRef.current = false;
    
    // 폴리곤 맵 정리
    polygonMapRef.current.clear();

    // 병렬 처리로 빠른 제거
    const polygons = tradeAreaPolygonsRef.current;
    const labels = tradeAreaLabelsRef.current;
    
    // 배치 처리로 한 번에 제거
    requestAnimationFrame(() => {
      polygons.forEach(polygon => polygon.setMap(null));
      labels.forEach(label => label.setMap(null));
    });
    
    // 참조 즉시 정리
    tradeAreaPolygonsRef.current = [];
    tradeAreaLabelsRef.current = [];
    eventListenersRef.current = [];
  }, []);

  // 상권별 폴리곤과 라벨 표시 함수 (레벨 1~5)
  const showTradeAreaPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;

    
    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    isShowingRef.current = true;

    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const eventCleanups: (() => void)[] = [];
    
    // 레벨 1~5일 때 글자 크기 설정
    const fontSize = 12; // 상권은 중간 크기

    // TradeAreaPoligon.json에서 폴리곤 데이터 가져오기
    const geometries = (tradeAreaPolygonData as any).geometries;
    if (!geometries || geometries.length === 0) return;

    // 폴리곤과 상권 데이터 매칭을 위한 배열
    const polygonDataArray: {
      polygon: KakaoPolygon;
      polygonPaths: PolygonPath[][];
      geometryIndex: number;
    }[] = [];

    // 먼저 모든 폴리곤을 생성하고 저장
    geometries.forEach((geometry: any, index: number) => {
      if ((geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') && geometry.coordinates) {
        let coordinatesArray: number[][][] = [];
        
        // MultiPolygon과 Polygon 모두 처리
        if (geometry.type === 'MultiPolygon') {
          // MultiPolygon의 경우 첫 번째 폴리곤만 사용
          coordinatesArray = geometry.coordinates[0];
        } else {
          // Polygon의 경우
          coordinatesArray = geometry.coordinates;
        }

        // 폴리곤 좌표 변환
        const polygonPaths: any[] = [];
        const convertedPolygonPaths: PolygonPath[][] = [];
        
        coordinatesArray.forEach((ring: number[][]) => {
          const path = ring.map((coord: number[]) => {
            // TM 좌표계를 WGS84로 정확한 변환
            const { lat, lng } = tmToWgs84(coord[0], coord[1]);
            return new (window.kakao.maps as any).LatLng(lat, lng);
          });
          polygonPaths.push(path);
          
          // Point-in-Polygon 검사를 위한 좌표 변환
          const convertedPath = convertKakaoLatLngsToPoints(path);
          convertedPolygonPaths.push(convertedPath);
        });

        // 카카오맵 Polygon 생성 (최적화된 설정)
        const kakaoPolygon = new (window.kakao.maps as any).Polygon({
          path: polygonPaths,
          strokeWeight: 1,
          strokeColor: '#3288FF',
          strokeOpacity: 0.8,
          fillColor: '#3288FF',
          fillOpacity: 0, // 기본값에서 배경 투명
          clickable: true, // 클릭 활성화하여 이벤트 처리
          zIndex: 2 // 상권 폴리곤이 가장 위에 표시
        }) as KakaoPolygon;

        // 지도에 폴리곤 표시
        kakaoPolygon.setMap(map);
        polygons.push(kakaoPolygon);
        
        // 폴리곤 데이터 저장
        polygonDataArray.push({
          polygon: kakaoPolygon,
          polygonPaths: convertedPolygonPaths,
          geometryIndex: index
        });

      }
    });

    // 이제 상권 데이터와 폴리곤을 실제 좌표 포함 관계로 매칭
    tradeAreaData.DATA.forEach((tradeArea: any, tradeAreaIndex: number) => {
      // 상권 중심 좌표 변환
      const { lat: centerLat, lng: centerLng } = tmToWgs84(tradeArea.xcnts_value, tradeArea.ydnts_value);
      const centerPoint: Point = { lat: centerLat, lng: centerLng };
      
      // 해당 좌표를 포함하는 폴리곤 찾기
      let matchingPolygonData = null;
      
      for (const polygonData of polygonDataArray) {
        // 각 폴리곤 경로에 대해 점 포함 여부 확인
        const isContained = polygonData.polygonPaths.some(path => 
          isPointInPolygon(centerPoint, path)
        );
        
        if (isContained) {
          matchingPolygonData = polygonData;
          break;
        }
      }
      
      // 매칭되는 폴리곤이 있는 경우에만 라벨 생성
      if (matchingPolygonData) {
        const position = new (window.kakao.maps as any).LatLng(centerLat, centerLng);
        
        // 상권 이름 라벨 생성
        const currentLabelId = `tradearea-label-${tradeAreaIndex}`;
        const content = `<div id="${currentLabelId}" class="tradearea-label" style="
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
          border-radius: 6px;
          border: 1px solid rgba(50, 136, 255, 0.8);
          transition: all 0.2s ease;
          position: relative;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        " onmouseover="this.style.backgroundColor='rgba(50, 136, 255, 0.9)'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1.05)'; this.style.zIndex='9999'; this.style.boxShadow='0 4px 12px rgba(50, 136, 255, 0.4)';" 
           onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.9)'; this.style.color='#000000'; this.style.textShadow='none'; this.style.transform='scale(1)'; this.style.zIndex='100'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        >${tradeArea.trdar_cd_nm}</div>`;

        const customOverlay = new (window.kakao.maps as any).CustomOverlay({
          map: map,
          position: position,
          content: content,
          yAnchor: 0.5,
          zIndex: 100
        }) as KakaoOverlay;

        // 폴리곤 맵에 데이터 저장 (이벤트 위임용)
        polygonMapRef.current.set(currentLabelId, {
          polygon: matchingPolygonData.polygon,
          centerLat,
          centerLng,
          polygonPaths: matchingPolygonData.polygonPaths
        });

        labels.push(customOverlay);
        
        console.log(`✅ 상권 "${tradeArea.trdar_cd_nm}" (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)})이 폴리곤 ${matchingPolygonData.geometryIndex}에 정확히 매칭됨`);
      } else {
        console.warn(`❌ 상권 "${tradeArea.trdar_cd_nm}" (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)})에 매칭되는 폴리곤을 찾을 수 없음`);
      }
    });

    tradeAreaPolygonsRef.current = polygons;
    tradeAreaLabelsRef.current = labels;
    eventListenersRef.current = eventCleanups;
    
  }, [map, setupGlobalEventDelegation]);

  useEffect(() => {
    if (!map || !window.kakao) return;

    let debounceTimer: NodeJS.Timeout;

    // 즉시 차단 시스템 - 레벨 1~5 범위를 벗어나면 바로 데이터 차단
    const zoomChangedListener = () => {
      const currentLevel = map.getLevel();
      
      // 레벨 1~5 범위를 벗어나면 즉시 강제 차단 (렌더링 전에 차단)
      if (currentLevel < 1 || currentLevel > 5) {
        if (isShowingRef.current) {
          // 즉시 모든 폴리곤 제거 (애니메이션 없이)
          tradeAreaPolygonsRef.current.forEach(polygon => polygon.setMap(null));
          tradeAreaLabelsRef.current.forEach(label => label.setMap(null));
          tradeAreaPolygonsRef.current = [];
          tradeAreaLabelsRef.current = [];
          polygonMapRef.current.clear();
          isShowingRef.current = false;
        }
        clearTimeout(debounceTimer);
        return;
      }
      
      // 레벨 1~5 범위에 있을 때만 표시
      if ((currentLevel >= 1 && currentLevel <= 5) && !isShowingRef.current) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          showTradeAreaPolygons();
        }, 50);
      }
    };

    // 이벤트 리스너 등록
    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', zoomChangedListener);

    // 초기 로드 시에도 엄격한 레벨 1~5 확인
    const initialLevel = map.getLevel();
    
    if (initialLevel >= 1 && initialLevel <= 5) {
      showTradeAreaPolygons();
    } else {
      // 레벨 1~5가 아니면 무조건 숨김
      hideTradeAreaPolygons();
    }

    // cleanup 함수
    return () => {
      clearTimeout(debounceTimer);
      hideTradeAreaPolygons();
      
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