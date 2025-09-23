'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import tradeAreaData from '../../data/TradeAreaValue.json';
import tradeAreaPolygonData from '../../data/TradeAreaPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { isPointInPolygon, convertKakaoLatLngsToPoints, Point, PolygonPath } from '../../utils/pointInPolygon';

// 동적 캐시 시스템 - 지도 이동에 따라 확장되는 캐시
const DYNAMIC_POLYGON_CACHE = {
  loadedAreas: new Set<string>(), // 로드된 영역 추적 (중심좌표 기반)
  visiblePolygons: [] as any[], // 표시된 폴리곤들
  maxCacheSize: 1000, // 최대 캐시 크기
  gridSize: 0.01 // 그리드 크기 (약 1km)
};

// 타입 정의
interface KakaoPolygon {
  setMap: (map: any) => void;
  setOptions: (options: any) => void;
  getOptions?: () => any;
}

interface KakaoOverlay {
  setMap: (map: any) => void;
}

interface TradeAreaPoligonProps {
  onTradeAreaSelect?: (tradeAreaName: string | null, tradeAreaCode: string | null) => void;
  onShowMarketList?: (district: string, dong: string) => void;
}

export default function TradeAreaPoligon({ onTradeAreaSelect, onShowMarketList }: TradeAreaPoligonProps) {
  const { map } = useKakaoMapContext();
  const tradeAreaPolygonsRef = useRef<KakaoPolygon[]>([]);
  const tradeAreaLabelsRef = useRef<KakaoOverlay[]>([]);
  const eventListenersRef = useRef<(() => void)[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number, polygonPaths: PolygonPath[][], tradeAreaName: string, district: string, dong: string}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);
  const selectTradeAreaHandlerRef = useRef<((e: Event) => void) | null>(null);
  const selectedTradeAreaRef = useRef<string | null>(null);

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

      const { polygon, centerLat, centerLng, tradeAreaName, district, dong } = polygonData;

      if (e.type === 'mouseenter') {
        // 선택된 상권이 아닌 경우에만 호버 효과 적용
        if (selectedTradeAreaRef.current !== labelId) {
          // 폴리곤 호버 효과
          polygon.setOptions({
            fillColor: '#3288FF',
            fillOpacity: 0.3,
            strokeWeight: 3,
            strokeColor: '#3288FF',
            strokeOpacity: 1,
            zIndex: 1000
          });
          
          // 라벨도 최상위로 올리기 (기본 레이아웃 유지하면서 hover 스타일 적용)
          if (target.style) {
            target.style.zIndex = '9999';
            target.style.transform = 'scale(1.05)';
            target.style.boxShadow = '0 4px 12px rgba(50, 136, 255, 0.4)';
            target.style.backgroundColor = 'rgba(50, 136, 255, 0.9)';
            target.style.color = '#ffffff';
            target.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
            // 기본 레이아웃 속성들 유지
            target.style.padding = '4px 8px';
            target.style.fontSize = `${12}px`;
            target.style.fontWeight = 'bold';
            target.style.textAlign = 'center';
            target.style.whiteSpace = 'nowrap';
            target.style.pointerEvents = 'auto';
            target.style.cursor = 'pointer';
            target.style.borderRadius = '6px';
            target.style.border = '1px solid rgba(50, 136, 255, 0.8)';
            target.style.transition = 'all 0.2s ease';
            target.style.position = 'relative';
          }
        }
      } else if (e.type === 'mouseleave') {
        // 선택된 상권이 아닌 경우에만 호버 효과 제거
        if (selectedTradeAreaRef.current !== labelId) {
          // 폴리곤 호버 효과 제거
          polygon.setOptions({
            fillColor: '#3288FF',
            fillOpacity: 0,
            strokeWeight: 1,
            strokeColor: '#3288FF',
            strokeOpacity: 0.8,
            zIndex: 2
          });
          
          // 라벨 원래 상태로 복원 (기본 스타일 유지)
          if (target.style) {
            target.style.zIndex = '100';
            target.style.transform = 'scale(1)';
            target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            target.style.color = '#000000';
            target.style.textShadow = 'none';
            // 기본 레이아웃 속성들 유지
            target.style.padding = '4px 8px';
            target.style.fontSize = `${12}px`;
            target.style.fontWeight = 'bold';
            target.style.textAlign = 'center';
            target.style.whiteSpace = 'nowrap';
            target.style.pointerEvents = 'auto';
            target.style.cursor = 'pointer';
            target.style.borderRadius = '6px';
            target.style.border = '1px solid rgba(50, 136, 255, 0.8)';
            target.style.transition = 'all 0.2s ease';
            target.style.position = 'relative';
          }
        }
      } else if (e.type === 'click') {
        // 이전에 선택된 상권이 있다면 해제
        if (selectedTradeAreaRef.current) {
          const prevPolygonData = polygonMapRef.current.get(selectedTradeAreaRef.current);
          if (prevPolygonData) {
            prevPolygonData.polygon.setOptions({
              fillColor: '#3288FF',
              fillOpacity: 0, // 기본 상태: 투명
              strokeWeight: 1,
              strokeColor: '#3288FF',
              strokeOpacity: 0.6,
              zIndex: 0
            });
            
            // 이전 라벨 스타일 복원 (기본 스타일 유지)
            const prevLabelElement = document.getElementById(selectedTradeAreaRef.current);
            if (prevLabelElement && prevLabelElement.style) {
              prevLabelElement.style.zIndex = '100';
              prevLabelElement.style.transform = 'scale(1)';
              prevLabelElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              prevLabelElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              prevLabelElement.style.color = '#000000';
              prevLabelElement.style.textShadow = 'none';
              // 기본 레이아웃 속성들 유지
              prevLabelElement.style.padding = '4px 8px';
              prevLabelElement.style.fontSize = `${12}px`;
              prevLabelElement.style.fontWeight = 'bold';
              prevLabelElement.style.textAlign = 'center';
              prevLabelElement.style.whiteSpace = 'nowrap';
              prevLabelElement.style.pointerEvents = 'auto';
              prevLabelElement.style.cursor = 'pointer';
              prevLabelElement.style.borderRadius = '6px';
              prevLabelElement.style.border = '1px solid rgba(50, 136, 255, 0.8)';
              prevLabelElement.style.transition = 'all 0.2s ease';
              prevLabelElement.style.position = 'relative';
            }
          }
        }

        // 새로운 상권 선택
        selectedTradeAreaRef.current = labelId;
        
        // 선택된 상권의 스타일 유지 (클릭 후에도 hover 상태 유지)
        polygon.setOptions({
          fillColor: '#3288FF',
          fillOpacity: 0.3,
          strokeWeight: 3,
          strokeColor: '#3288FF',
          strokeOpacity: 1,
          zIndex: 1000
        });
        
        // 라벨 스타일 유지 (기본 레이아웃 유지하면서 선택 스타일 적용)
        if (target.style) {
          target.style.zIndex = '9999';
          target.style.transform = 'scale(1.05)';
          target.style.boxShadow = '0 4px 12px rgba(50, 136, 255, 0.4)';
          target.style.backgroundColor = 'rgba(50, 136, 255, 0.9)';
          target.style.color = '#ffffff';
          target.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
          // 기본 레이아웃 속성들 유지
          target.style.padding = '4px 8px';
          target.style.fontSize = `${12}px`;
          target.style.fontWeight = 'bold';
          target.style.textAlign = 'center';
          target.style.whiteSpace = 'nowrap';
          target.style.pointerEvents = 'auto';
          target.style.cursor = 'pointer';
          target.style.borderRadius = '6px';
          target.style.border = '1px solid rgba(50, 136, 255, 0.8)';
          target.style.transition = 'all 0.2s ease';
          target.style.position = 'relative';
        }

        // 지도 중심 이동 및 확대
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        map.setLevel(4);
        
        // 상권명으로 상권코드 찾기
        const tradeAreaCode = tradeAreaData.DATA.find(area => area.trdar_cd_nm === tradeAreaName)?.trdar_cd || null;
        console.log("🔍 상권 클릭:", { tradeAreaName, tradeAreaCode });
        
        // 상권명과 상권코드를 부모 컴포넌트로 전달
        onTradeAreaSelect?.(tradeAreaName, tradeAreaCode);
        
        // 상권리스트 활성화
        onShowMarketList?.(district, dong);
      }
    };

    document.addEventListener('mouseenter', globalEventHandler, true);
    document.addEventListener('mouseleave', globalEventHandler, true);
    document.addEventListener('click', globalEventHandler, true);
    
    // selectTradeArea 이벤트 리스너 추가 (AdstrdMarketList에서 상권 선택 시)
    const handleSelectTradeArea = (event: CustomEvent) => {
      const { code, name } = event.detail;
      console.log('🎯 selectTradeArea 이벤트 수신:', { code, name });
      
      // 해당 상권의 폴리곤과 라벨 찾기
      const labelElements = document.querySelectorAll('.tradearea-label');
      let targetLabel: HTMLElement | null = null;
      
      labelElements.forEach((label) => {
        const labelElement = label as HTMLElement;
        if (labelElement.textContent?.includes(name)) {
          targetLabel = labelElement;
        }
      });
      
      if (targetLabel) {
        const labelId = (targetLabel as HTMLElement).id;
        const polygonData = polygonMapRef.current.get(labelId);
        
        if (polygonData) {
          const { polygon } = polygonData;
          
          // 이전 선택된 상권 스타일 초기화
          if (selectedTradeAreaRef.current && selectedTradeAreaRef.current !== labelId) {
            const previousPolygonData = polygonMapRef.current.get(selectedTradeAreaRef.current);
            if (previousPolygonData) {
              // 상권 모드가 활성화된 상태에서는 기본 상권 모드 스타일로 복원
              previousPolygonData.polygon.setOptions({
                fillColor: '#3288FF',
                fillOpacity: 0, // 기본 상태: 투명
                strokeWeight: 1,
                strokeColor: '#3288FF',
                strokeOpacity: 0.6,
                zIndex: 0
              });
            }
          }
          
          // 새로운 상권 선택
          selectedTradeAreaRef.current = labelId;
          
          // 선택된 상권의 스타일 적용
          polygon.setOptions({
            fillColor: '#3288FF',
            fillOpacity: 0.3,
            strokeWeight: 3,
            strokeColor: '#3288FF',
            strokeOpacity: 1,
            zIndex: 1000
          });
          
          console.log('✅ 상권 폴리곤 스타일 적용 완료:', name);
        }
      }
    };
    
    selectTradeAreaHandlerRef.current = handleSelectTradeArea as EventListener;
    window.addEventListener('selectTradeArea', selectTradeAreaHandlerRef.current);
    
    globalEventListenerRef.current = globalEventHandler;
  }, [map, onTradeAreaSelect, onShowMarketList]);

  // 상권별 폴리곤과 라벨 숨김 함수 (고성능 최적화)
  const hideTradeAreaPolygons = useCallback(() => {
    if (!isShowingRef.current) return;

    // 즉시 상태 변경으로 중복 실행 방지
    isShowingRef.current = false;
    
    // 선택 상태 초기화
    selectedTradeAreaRef.current = null;
    onTradeAreaSelect?.(null, null);
    
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
  }, [onTradeAreaSelect, onShowMarketList]);

  // 동적 영역 기반 폴리곤 표시 함수
  const showTradeAreaPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;

    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    isShowingRef.current = true;

    // 현재 지도 중심좌표와 레벨 확인
    const currentCenter = map.getCenter();
    const currentLevel = map.getLevel();
    const currentLat = currentCenter.getLat();
    const currentLng = currentCenter.getLng();

    console.log('🔍 폴리곤 표시 시작:', { currentLat, currentLng, currentLevel });

    // 임시로 전체 폴리곤 표시 (동적 캐시 문제 해결 후 수정)
    console.log('🔄 전체 폴리곤 로드');
    showAllPolygons();
  }, [map, setupGlobalEventDelegation]);

  // 현재 영역에 대한 폴리곤 로드 함수
  const loadPolygonsForCurrentArea = useCallback((centerLat: number, centerLng: number, level: number) => {
    console.log('🔧 현재 영역 폴리곤 로드 중...', { centerLat, centerLng, level });
    
    const geometries = (tradeAreaPolygonData as any).geometries;
    if (!geometries || geometries.length === 0) return;

    // 현재 영역의 그리드 키 생성
    const gridKey = `${Math.floor(centerLat / DYNAMIC_POLYGON_CACHE.gridSize)}_${Math.floor(centerLng / DYNAMIC_POLYGON_CACHE.gridSize)}`;
    
    // 이미 로드된 영역이면 스킵
    if (DYNAMIC_POLYGON_CACHE.loadedAreas.has(gridKey)) {
      return;
    }

    // 현재 지도 영역 내의 상권들 필터링
    const visibleRange = getVisibleRange(centerLat, centerLng, level);
    const filteredTradeAreas = tradeAreaData.DATA.filter((tradeArea: any) => {
      const { lat: areaLat, lng: areaLng } = tmToWgs84(tradeArea.xcnts_value, tradeArea.ydnts_value);
      return areaLat >= visibleRange.minLat && areaLat <= visibleRange.maxLat &&
             areaLng >= visibleRange.minLng && areaLng <= visibleRange.maxLng;
    });

    console.log(`📍 현재 영역 내 상권 ${filteredTradeAreas.length}개 발견`);

    // 폴리곤과 상권 데이터 매칭
    const polygonDataArray: {
      polygon: KakaoPolygon;
      polygonPaths: PolygonPath[][];
      geometryIndex: number;
    }[] = [];

    // 현재 영역과 관련된 폴리곤들만 생성
    geometries.forEach((geometry: any, index: number) => {
      if ((geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') && geometry.coordinates) {
        let coordinatesArray: number[][][] = [];
        
        if (geometry.type === 'MultiPolygon') {
          coordinatesArray = geometry.coordinates[0];
        } else {
          coordinatesArray = geometry.coordinates;
        }

        const polygonPaths: any[] = [];
        const convertedPolygonPaths: PolygonPath[][] = [];
        
        coordinatesArray.forEach((ring: number[][]) => {
          const path = ring.map((coord: number[]) => {
            const { lat, lng } = tmToWgs84(coord[0], coord[1]);
            return new (window.kakao.maps as any).LatLng(lat, lng);
          });
          polygonPaths.push(path);
          
          const convertedPath = convertKakaoLatLngsToPoints(path);
          convertedPolygonPaths.push(convertedPath);
        });

        const kakaoPolygon = new (window.kakao.maps as any).Polygon({
          path: polygonPaths,
          strokeWeight: 1,
          strokeColor: '#3288FF',
          strokeOpacity: 0.8,
          fillColor: '#3288FF',
          fillOpacity: 0,
          clickable: true,
          zIndex: 2
        }) as KakaoPolygon;

        polygonDataArray.push({
          polygon: kakaoPolygon,
          polygonPaths: convertedPolygonPaths,
          geometryIndex: index
        });
      }
    });

    // 현재 영역의 상권들과 폴리곤 매칭
    const newPolygons: any[] = [];
    filteredTradeAreas.forEach((tradeArea: any, tradeAreaIndex: number) => {
      const { lat: centerLat, lng: centerLng } = tmToWgs84(tradeArea.xcnts_value, tradeArea.ydnts_value);
      const centerPoint: Point = { lat: centerLat, lng: centerLng };
      
      // 해당 좌표를 포함하는 폴리곤 찾기
      for (const polygonData of polygonDataArray) {
        const isContained = polygonData.polygonPaths.some(path => 
          isPointInPolygon(centerPoint, path)
        );
        
        if (isContained) {
          newPolygons.push({
            id: `tradearea-label-${tradeAreaIndex}`,
            tradeAreaName: tradeArea.trdar_cd_nm,
            district: tradeArea.signgu_cd_nm,
            dong: tradeArea.adstrd_cd_nm,
            centerLat,
            centerLng,
            polygonPaths: polygonData.polygonPaths,
            polygon: polygonData.polygon
          });
          break;
        }
      }
    });

    // 캐시에 추가
    DYNAMIC_POLYGON_CACHE.visiblePolygons.push(...newPolygons);
    DYNAMIC_POLYGON_CACHE.loadedAreas.add(gridKey);

    // 캐시 크기 제한
    if (DYNAMIC_POLYGON_CACHE.visiblePolygons.length > DYNAMIC_POLYGON_CACHE.maxCacheSize) {
      const removeCount = DYNAMIC_POLYGON_CACHE.visiblePolygons.length - DYNAMIC_POLYGON_CACHE.maxCacheSize;
      DYNAMIC_POLYGON_CACHE.visiblePolygons.splice(0, removeCount);
    }

    console.log(`✅ 동적 캐시 업데이트: ${newPolygons.length}개 상권 추가, 총 ${DYNAMIC_POLYGON_CACHE.visiblePolygons.length}개`);
    
    // 새로 로드된 폴리곤들 표시
    showDynamicCachedPolygons();
  }, []);

  // 지도 레벨에 따른 가시 범위 계산
  const getVisibleRange = (centerLat: number, centerLng: number, level: number) => {
    // 레벨에 따른 반경 계산 (대략적인 값)
    const radius = Math.pow(2, 8 - level) * 0.01; // 레벨이 낮을수록 더 넓은 범위
    
    return {
      minLat: centerLat - radius,
      maxLat: centerLat + radius,
      minLng: centerLng - radius,
      maxLng: centerLng + radius
    };
  };

  // 동적 캐시된 폴리곤 표시 함수
  const showDynamicCachedPolygons = useCallback(() => {
    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const fontSize = 12;

    console.log('🔍 동적 캐시 폴리곤 표시 시작:', DYNAMIC_POLYGON_CACHE.visiblePolygons.length);

    DYNAMIC_POLYGON_CACHE.visiblePolygons.forEach((cachedPolygon, index) => {
      // 캐시된 폴리곤 경로를 카카오맵 좌표로 변환
      const polygonPaths = cachedPolygon.polygonPaths.map((path: any) => 
        path.map((point: any) => new (window.kakao.maps as any).LatLng(point.lat, point.lng))
      );

      // 카카오맵 Polygon 생성
      const kakaoPolygon = new (window.kakao.maps as any).Polygon({
        path: polygonPaths,
        strokeWeight: 1,
        strokeColor: '#3288FF',
        strokeOpacity: 0.8,
        fillColor: '#3288FF',
        fillOpacity: 0,
        clickable: true,
        zIndex: 2
      }) as KakaoPolygon;

      kakaoPolygon.setMap(map);
      polygons.push(kakaoPolygon);

      // 라벨 생성
      const position = new (window.kakao.maps as any).LatLng(cachedPolygon.centerLat, cachedPolygon.centerLng);
      const content = `<div id="${cachedPolygon.id}" class="tradearea-label" style="
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
      ">${cachedPolygon.tradeAreaName}</div>`;

      const customOverlay = new (window.kakao.maps as any).CustomOverlay({
        map: map,
        position: position,
        content: content,
        yAnchor: 0.5,
        zIndex: 100
      }) as KakaoOverlay;

      // 폴리곤 맵에 데이터 저장
      polygonMapRef.current.set(cachedPolygon.id, {
        polygon: kakaoPolygon,
        centerLat: cachedPolygon.centerLat,
        centerLng: cachedPolygon.centerLng,
        polygonPaths: cachedPolygon.polygonPaths,
        tradeAreaName: cachedPolygon.tradeAreaName,
        district: cachedPolygon.district,
        dong: cachedPolygon.dong
      });

      labels.push(customOverlay);
    });

    tradeAreaPolygonsRef.current = polygons;
    tradeAreaLabelsRef.current = labels;
    
    console.log(`✅ 동적 캐시 폴리곤 ${polygons.length}개 표시 완료`);
  }, [map]);

  // 전체 폴리곤 표시 함수
  const showAllPolygons = useCallback(() => {
    console.log('🚀 showAllPolygons 시작');
    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const fontSize = 12;

    // TradeAreaPoligon.json에서 폴리곤 데이터 가져오기
    const geometries = (tradeAreaPolygonData as any).geometries;
    console.log('📊 폴리곤 데이터:', geometries?.length || 0);
    if (!geometries || geometries.length === 0) {
      console.log('❌ 폴리곤 데이터가 없음');
      return;
    }

    // 폴리곤과 상권 데이터 매칭을 위한 배열
    const polygonDataArray: {
      polygon: KakaoPolygon;
      polygonPaths: PolygonPath[][];
      geometryIndex: number;
    }[] = [];

    console.log('🔧 폴리곤 생성 시작');
    // 먼저 모든 폴리곤을 생성하고 저장
    geometries.forEach((geometry: any, index: number) => {
      if ((geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') && geometry.coordinates) {
        console.log(`📐 폴리곤 ${index} 생성 중...`);
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
        console.log(`✅ 폴리곤 ${index} 지도에 표시 완료`);
        
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
        ">${tradeArea.trdar_cd_nm}</div>`;

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
          polygonPaths: matchingPolygonData.polygonPaths,
          tradeAreaName: tradeArea.trdar_cd_nm,
          district: tradeArea.signgu_cd_nm,
          dong: tradeArea.adstrd_cd_nm
        });

        labels.push(customOverlay);
        
        console.log(`✅ 상권 "${tradeArea.trdar_cd_nm}" (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)})이 폴리곤 ${matchingPolygonData.geometryIndex}에 정확히 매칭됨`);
      } else {
        console.warn(`❌ 상권 "${tradeArea.trdar_cd_nm}" (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)})에 매칭되는 폴리곤을 찾을 수 없음`);
      }
    });

    tradeAreaPolygonsRef.current = polygons;
    tradeAreaLabelsRef.current = labels;
    
    console.log(`✅ 전체 폴리곤 ${polygons.length}개, 라벨 ${labels.length}개 표시 완료`);
  }, [map]);

  // 동적 캐시 초기화
  useEffect(() => {
    if (!window.kakao) return;
    
    // 동적 캐시 초기화
    const initializeDynamicCache = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('🚀 동적 캐시 시스템 초기화');
        DYNAMIC_POLYGON_CACHE.loadedAreas.clear();
        DYNAMIC_POLYGON_CACHE.visiblePolygons = [];
      } else {
        setTimeout(initializeDynamicCache, 100);
      }
    };
    
    initializeDynamicCache();
  }, []);

  useEffect(() => {
    if (!map || !window.kakao) return;

    let debounceTimer: NodeJS.Timeout;

    // 지도 이동 및 줌 변경 이벤트 리스너
    const mapChangedListener = () => {
      const currentLevel = map.getLevel();
      
      // 레벨 1~5 범위를 벗어나면 즉시 강제 차단
      if (currentLevel < 1 || currentLevel > 5) {
        if (isShowingRef.current) {
          // 즉시 모든 폴리곤 제거
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
      
      // 레벨 1~5 범위에 있을 때 동적 로드
      if (currentLevel >= 1 && currentLevel <= 5) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          showTradeAreaPolygons();
        }, 100); // 디바운싱으로 성능 최적화
      }
    };

    // 이벤트 리스너 등록 (지도 이동과 줌 변경 모두 감지)
    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', mapChangedListener);
    (window as any).kakao.maps.event.addListener(map, 'dragend', mapChangedListener);
    (window as any).kakao.maps.event.addListener(map, 'center_changed', mapChangedListener);

    // 초기 로드 시에도 엄격한 레벨 1~5 확인
    const initialLevel = map.getLevel();
    
    if (initialLevel >= 1 && initialLevel <= 5) {
      showTradeAreaPolygons();
    } else {
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
      
      // selectTradeArea 이벤트 리스너 제거
      if (selectTradeAreaHandlerRef.current) {
        window.removeEventListener('selectTradeArea', selectTradeAreaHandlerRef.current);
        selectTradeAreaHandlerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null; // UI 요소 없음
}