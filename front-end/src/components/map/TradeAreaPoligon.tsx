'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import tradeAreaData from '../../data/TradeAreaValue.json';
import tradeAreaPolygonData from '../../data/TradeAreaPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { isPointInPolygon, convertKakaoLatLngsToPoints, Point, PolygonPath } from '../../utils/pointInPolygon';

// 레벨 3 중심좌표 기반 폴리곤 캐시 (역삼역 중심)
// 실제 역삼역 상권 데이터 기반 정확한 캐시
const INITIAL_POLYGON_CACHE = {
  centerLat: 37.5008,
  centerLng: 127.0387,
  level: 3,
  visiblePolygons: [] // 빈 배열로 초기화 - 실제 데이터에서 동적으로 생성
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
        const labelId = targetLabel.id;
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

  // 상권별 폴리곤과 라벨 표시 함수 (레벨 1~5) - 캐시 우선
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

    // 현재 지도 중심좌표와 레벨 확인
    const currentCenter = map.getCenter();
    const currentLevel = map.getLevel();
    const currentLat = currentCenter.getLat();
    const currentLng = currentCenter.getLng();

    // 캐시된 데이터와 비교 (레벨 3~4이고 중심좌표가 비슷한 경우)
    const isCacheApplicable = (currentLevel >= 3 && currentLevel <= 4) &&
      Math.abs(currentLat - INITIAL_POLYGON_CACHE.centerLat) < 0.005 &&
      Math.abs(currentLng - INITIAL_POLYGON_CACHE.centerLng) < 0.005;

    if (isCacheApplicable) {
      console.log('🚀 캐시된 폴리곤 데이터 사용');
      showCachedPolygons();
      return;
    }

    console.log('🔄 캐시 적용 불가, 전체 폴리곤 로드');
    showAllPolygons();
  }, [map, setupGlobalEventDelegation]);

  // 실제 데이터 기반 정확한 캐시 생성 함수
  const generateAccurateCache = useCallback(() => {
    if (INITIAL_POLYGON_CACHE.visiblePolygons.length > 0) {
      return; // 이미 생성됨
    }

    console.log('🔧 정확한 캐시 데이터 생성 중...');
    
    const geometries = (tradeAreaPolygonData as any).geometries;
    if (!geometries || geometries.length === 0) return;

    // 역삼역 상권 중심 좌표
    const yeoksamCenter = tmToWgs84(203179, 444549); // 역삼역 상권 중심
    
    // 폴리곤과 상권 데이터 매칭을 위한 배열
    const polygonDataArray: {
      polygon: KakaoPolygon;
      polygonPaths: PolygonPath[][];
      geometryIndex: number;
    }[] = [];

    // 모든 폴리곤을 생성하고 저장
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

    // 역삼역 중심 좌표 주변의 상권들만 캐시에 추가
    tradeAreaData.DATA.forEach((tradeArea: any, tradeAreaIndex: number) => {
      const { lat: centerLat, lng: centerLng } = tmToWgs84(tradeArea.xcnts_value, tradeArea.ydnts_value);
      
      // 역삼역 중심에서 0.01도 이내의 상권들만 캐시에 포함
      const distance = Math.sqrt(
        Math.pow(centerLat - yeoksamCenter.lat, 2) + 
        Math.pow(centerLng - yeoksamCenter.lng, 2)
      );
      
      if (distance <= 0.01) { // 약 1km 반경
        const centerPoint: Point = { lat: centerLat, lng: centerLng };
        
        // 해당 좌표를 포함하는 폴리곤 찾기
        for (const polygonData of polygonDataArray) {
          const isContained = polygonData.polygonPaths.some(path => 
            isPointInPolygon(centerPoint, path)
          );
          
          if (isContained) {
            INITIAL_POLYGON_CACHE.visiblePolygons.push({
              id: `tradearea-label-${tradeAreaIndex}`,
              tradeAreaName: tradeArea.trdar_cd_nm,
              district: tradeArea.signgu_cd_nm,
              dong: tradeArea.adstrd_cd_nm,
              centerLat,
              centerLng,
              polygonPaths: polygonData.polygonPaths
            });
            break;
          }
        }
      }
    });

    console.log(`✅ 정확한 캐시 생성 완료: ${INITIAL_POLYGON_CACHE.visiblePolygons.length}개 상권`);
  }, []);

  // 캐시된 폴리곤 표시 함수
  const showCachedPolygons = useCallback(() => {
    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const fontSize = 12;

    // 캐시가 비어있으면 정확한 캐시 생성
    if (INITIAL_POLYGON_CACHE.visiblePolygons.length === 0) {
      generateAccurateCache();
    }

    INITIAL_POLYGON_CACHE.visiblePolygons.forEach((cachedPolygon, index) => {
      // 캐시된 폴리곤 경로를 카카오맵 좌표로 변환
      const polygonPaths = cachedPolygon.polygonPaths.map(path => 
        path.map(point => new (window.kakao.maps as any).LatLng(point.lat, point.lng))
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
    
    console.log(`✅ 캐시된 폴리곤 ${polygons.length}개 표시 완료`);
  }, [map, generateAccurateCache]);

  // 전체 폴리곤 표시 함수
  const showAllPolygons = useCallback(() => {
    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const fontSize = 12;

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
    
    console.log(`✅ 전체 폴리곤 ${polygons.length}개 표시 완료`);
  }, [map]);

  // 초기 캐시 미리 생성
  useEffect(() => {
    if (!window.kakao) return;
    
    // 카카오맵 로드 후 즉시 캐시 생성
    const initializeCache = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('🚀 초기 캐시 생성 시작');
        generateAccurateCache();
      } else {
        setTimeout(initializeCache, 100);
      }
    };
    
    initializeCache();
  }, []);

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