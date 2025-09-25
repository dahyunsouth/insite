'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import tradeAreaData from '../../data/TradeAreaValue.json';
import tradeAreaPolygonData from '../../data/TradeAreaPoligon.json';
import seoulPolygonData from '../../data/SeoulPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { API_ENDPOINTS } from '../../config/api';
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
  const polygonMapRef = useRef<Map<string, {
    polygon: KakaoPolygon,
    overlay: KakaoOverlay,
    defaultContent: string,
    centerLat: number,
    centerLng: number,
    polygonPaths: PolygonPath[][],
    tradeAreaName: string,
    district: string,
    dong: string
  }>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);
  const selectTradeAreaHandlerRef = useRef<((e: Event) => void) | null>(null);
  const selectedTradeAreaRef = useRef<string | null>(null);
  const didAutoSelectRef = useRef<boolean>(false);
  const backgroundOverlayRef = useRef<KakaoOverlay | null>(null);
  const tradeAreasCacheRef = useRef<Map<string, any>>(new Map());

  // 금액 포맷터: 평균 금액을 억원/만원 단위로 변환
  const formatAverageAmount = useCallback((amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억 원`;
    }
    return `${Math.round(amount / 10000).toLocaleString()}만 원`;
  }, []);

  // 동 이름 정규화 (API 요구 형태 맞추기)
  const normalizeDongName = useCallback((dong: string): string => {
    const trimmed = (dong || '').trim();
    let normalized = trimmed.replace(/[\.|·|ㆍ]/g, '?');
    const noSpace = normalized.replace(/\s+/g, '');
    if (/^면목(제)?3[\.·ㆍ\?]8동$/.test(noSpace)) {
      normalized = '면목3?8동';
    }
    return normalized;
  }, []);

  // 상권명 비교용 정규화: 구분자(?, ·, ㆍ, .), 공백 제거 후 비교
  const normalizeAreaNameForCompare = useCallback((name: string): string => {
    return (name || '')
      .toLowerCase()
      .replace(/[\s·\.ㆍ\?]/g, '');
  }, []);

  // 캐시에서 총매출과 점포수 조회 시도
  const getSalesAndStoresFromCache = useCallback((district: string, dong: string, tradeAreaName: string): { total: number; stores: number } | null => {
    const key = `${district}|${normalizeDongName(dong)}`;
    const areas = tradeAreasCacheRef.current.get(key);
    if (!areas || !Array.isArray(areas)) return null;
    const found = areas.find((a: any) => {
      const apiName = a.trdarCdNm || a.trdar_cd_nm || '';
      return normalizeAreaNameForCompare(apiName) === normalizeAreaNameForCompare(tradeAreaName);
    });
    if (!found) return null;
    const total: number = found.thsmonSelngAmt ?? found.detail?.sales?.thsmonSelngAmt ?? 0;
    const stores: number = found.storCo ?? found.detail?.stor?.storCo ?? 0;
    return { total, stores };
  }, [normalizeDongName, normalizeAreaNameForCompare]);

  // /trade-areas 응답을 활용해 평균 매출 표시 업데이트 (동 단위 캐시)
  const updateTradeAreaLabelSales = useCallback(async (labelId: string, tradeAreaName: string, district: string, dong: string, attempt: number = 0) => {
    try {
      const cacheKey = `${district}|${normalizeDongName(dong)}`;
      let areas: any[] | null = null;

      if (tradeAreasCacheRef.current.has(cacheKey)) {
        areas = tradeAreasCacheRef.current.get(cacheKey);
      } else {
        // 항상 정규화된 행정동명으로만 호출
        const url = `${API_ENDPOINTS.TRADE_AREAS}?district=${encodeURIComponent(district)}&dong=${encodeURIComponent(normalizeDongName(dong))}`;
        const resp = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!resp.ok) return;
        const data = await resp.json();
        areas = data?.result?.areas ?? null;
        if (areas) tradeAreasCacheRef.current.set(cacheKey, areas);
      }

      if (!areas || !Array.isArray(areas)) return;
      const found = areas.find((a: any) => {
        const apiName = a.trdarCdNm || a.trdar_cd_nm || '';
        return normalizeAreaNameForCompare(apiName) === normalizeAreaNameForCompare(tradeAreaName);
      });
      if (!found) return;

      const total: number = found.thsmonSelngAmt ?? found.detail?.sales?.thsmonSelngAmt ?? 0;
      const stores: number = found.storCo ?? found.detail?.stor?.storCo ?? 0;
      const text = total > 0
        ? `월 ${formatAverageAmount(total)} / ${stores}개`
        : `매출 정보 없음 / ${stores}개`;

      // 우선 DOM이 아직 생성되지 않았다면 재시도
      const labelElement = document.getElementById(labelId) as HTMLElement | null;
      if (!labelElement && attempt < 10) {
        setTimeout(() => {
          updateTradeAreaLabelSales(labelId, tradeAreaName, district, dong, attempt + 1);
        }, 80);
        return;
      }

      // overlay.setContent로 안전하게 전체 라벨 콘텐츠 교체 (재렌더 방지)
      const polygonData = polygonMapRef.current.get(labelId);
      if (polygonData && (polygonData.overlay as any)?.setContent) {
        const buildContent = (id: string, name: string, subtitle: string, fontSize: number) => {
          return `<div id="${id}" class="tradearea-label" style="
        padding: 6px 12px;
        font-size: ${fontSize}px;
        font-weight: bold;
        color: #ffffff;
        text-align: center;
        white-space: nowrap;
        pointer-events: auto;
        cursor: pointer;
        text-shadow: none;
        background-color: #3288FF;
        border-radius: 6px;
        border: 1px solid rgba(50, 136, 255, 0.8);
        transition: all 0.2s ease;
        position: relative;
        z-index: 100;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <svg role="img" aria-label="머그컵" xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 64 64" width="32" height="100%" 
             fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <rect x="12" y="20" width="28" height="28" rx="4" stroke-width="3"/>
          <path d="M40 28h4c2 0 4 2 4 6s-2 6-4 6h-4" stroke-width="3"/>
          <path d="M20 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/>
          <path d="M28 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/>
        </svg>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;">
          <div style="font-size: 14px; color: #ffffff;">${name}</div>
          <div style="font-size: 12px; color: #ffffff; font-weight: normal;">${subtitle}</div>
        </div>
      </div>`;
        };
        (polygonData.overlay as any).setContent(buildContent(labelId, tradeAreaName, text, 12));
        return;
      }

      // fallback: 기존 DOM 교체 방식
      if (labelElement) {
        const textContainer = labelElement.querySelector('div[style*="flex-direction: column"]') as HTMLElement | null;
        if (!textContainer) return;
        const lines = textContainer.querySelectorAll('div');
        if (lines && lines.length >= 2) {
          (lines[1] as HTMLElement).textContent = text;
        }
      }
    } catch {}
  }, [formatAverageAmount, normalizeDongName, normalizeAreaNameForCompare]);

  // 전역 이벤트 위임 설정
  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return; // 이미 설정됨

    const globalEventHandler = (e: Event) => {
      const rawTarget = e.target as HTMLElement;
      const target = (rawTarget && (rawTarget.closest ? rawTarget.closest('.tradearea-label') : null)) as HTMLElement | null;
      if (!target) return;
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
          
          // overlay zIndex만 올리고, content 스타일만 수정
          const data = polygonMapRef.current.get(labelId);
          if (data) {
            (data.overlay as any).setZIndex(10000);
            if (target.style) {
              target.style.transform = 'scale(1.05)';
              target.style.backgroundColor = '#ffffff';
              target.style.color = '#000000';
            }
            const svgElement = target.querySelector('svg');
            if (svgElement) (svgElement as any).style.color = '#000000';
            const textContainer = target.querySelector('div[style*="flex-direction: column"]');
            if (textContainer) {
              const [nameEl, salesEl] = Array.from(textContainer.querySelectorAll('div'));
              if (nameEl) (nameEl as any).style.color = '#000000';
              if (salesEl) (salesEl as any).style.color = '#3288FF';
            }
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
          
          const data = polygonMapRef.current.get(labelId);
          if (data) {
            (data.overlay as any).setZIndex(100);
          }
          if (target.style) {
            target.style.transform = 'scale(1)';
            target.style.backgroundColor = '#3288FF';
            target.style.color = '#ffffff';
          }
          const svgElement = target.querySelector('svg');
          if (svgElement) (svgElement as any).style.color = '#ffffff';
          const textContainer = target.querySelector('div[style*="flex-direction: column"]');
          if (textContainer) {
            const [nameEl, salesEl] = Array.from(textContainer.querySelectorAll('div'));
            if (nameEl) (nameEl as any).style.color = '#ffffff';
            if (salesEl) (salesEl as any).style.color = '#ffffff';
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
            // 이전 선택 Overlay zIndex 복원
            if ((prevPolygonData.overlay as any)?.setZIndex) {
              (prevPolygonData.overlay as any).setZIndex(100);
            }
            
            // 이전 라벨 스타일 복원 (기본 스타일 유지)
            const prevLabelElement = document.getElementById(selectedTradeAreaRef.current);
            if (prevLabelElement && prevLabelElement.style) {
              prevLabelElement.style.zIndex = '100';
              prevLabelElement.style.transform = 'scale(1)';
              prevLabelElement.style.backgroundColor = '#3288FF';
              prevLabelElement.style.color = '#ffffff';
              prevLabelElement.style.textShadow = 'none';
              // 기본 레이아웃 속성들 유지
              prevLabelElement.style.padding = '6px 12px';
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

              // 내부 SVG/텍스트 색상도 기본(흰색)으로 복원
              const prevSvg = prevLabelElement.querySelector('svg') as HTMLElement | null;
              if (prevSvg) prevSvg.style.color = '#ffffff';
              const prevTextContainer = prevLabelElement.querySelector('div[style*="flex-direction: column"]');
              if (prevTextContainer) {
                const prevTextDivs = prevTextContainer.querySelectorAll('div');
                prevTextDivs.forEach((el) => ((el as HTMLElement).style.color = '#ffffff'));
              }
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
        
        // 선택 상태도 호버와 동일한 스타일/동작 적용 (재생성 금지)
        const data = polygonMapRef.current.get(labelId);
        if (data) {
          (data.overlay as any).setZIndex(10000);
        }
        if (target.style) {
          target.style.transform = 'scale(1.05)';
          target.style.backgroundColor = '#ffffff';
          target.style.color = '#000000';
        }
        const svgElement = target.querySelector('svg');
        if (svgElement) (svgElement as any).style.color = '#000000';
        const textContainer = target.querySelector('div[style*="flex-direction: column"]');
        if (textContainer) {
          const [nameEl, salesEl] = Array.from(textContainer.querySelectorAll('div'));
          if (nameEl) (nameEl as any).style.color = '#000000';
          if (salesEl) (salesEl as any).style.color = '#3288FF';
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

    // 배경 오버레이 제거
    if (backgroundOverlayRef.current) {
      backgroundOverlayRef.current.setMap(null);
      backgroundOverlayRef.current = null;
    }
  }, [onTradeAreaSelect, onShowMarketList]);

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

  // 동적 영역 기반 폴리곤 표시 함수
  const showTradeAreaPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;

    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    isShowingRef.current = true;

    // 서울 외부 영역을 회색 처리하는 도넛 오버레이 표시
    showBackgroundOverlay();

    // 현재 지도 중심좌표와 레벨 확인
    const currentCenter = map.getCenter();
    const currentLevel = map.getLevel();
    const currentLat = currentCenter.getLat();
    const currentLng = currentCenter.getLng();

    console.log('🔍 폴리곤 표시 시작:', { currentLat, currentLng, currentLevel });

    // 임시로 전체 폴리곤 표시 (동적 캐시 문제 해결 후 수정)
    console.log('🔄 전체 폴리곤 로드');
    showAllPolygons();

    // 초기 자동 선택: 성수동카페거리
    if (!didAutoSelectRef.current) {
      didAutoSelectRef.current = true;
      setTimeout(() => {
        try {
          const labels = document.querySelectorAll('.tradearea-label');
          let targetLabel: HTMLElement | null = null;
          labels.forEach((el) => {
            const text = (el as HTMLElement).textContent || '';
            if (text.includes('성수동카페거리') && !targetLabel) targetLabel = el as HTMLElement;
          });
          if (targetLabel) {
            targetLabel.click();
          }
        } catch {}
      }, 200);
    }
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
      // 캐시에서 평균 매출 즉시 표시 시도 (없으면 플레이스홀더)
      const cached = getSalesAndStoresFromCache(cachedPolygon.district, cachedPolygon.dong, cachedPolygon.tradeAreaName);
      const subtitle = cached != null 
        ? (cached.total > 0 
            ? `월 ${formatAverageAmount(cached.total)} / ${cached.stores}개`
            : `매출 정보 없음 / ${cached.stores}개`)
        : '월 매출 영역';

      const content = `<div id="${cachedPolygon.id}" class="tradearea-label" style="
        padding: 6px 12px;
        font-size: ${fontSize}px;
        font-weight: bold;
        color: #ffffff;
        text-align: center;
        white-space: nowrap;
        pointer-events: auto;
        cursor: pointer;
        text-shadow: none;
        background-color: #3288FF;
        border-radius: 6px;
        border: 1px solid rgba(50, 136, 255, 0.8);
        transition: all 0.2s ease;
        position: relative;
        z-index: 100;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <svg role="img" aria-label="머그컵" xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 64 64" width="32" height="100%" 
             fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <!-- 컵 본체 -->
          <rect x="12" y="20" width="28" height="28" rx="4" stroke-width="3"/>
          <!-- 손잡이 (ㄷ자 형태) -->
          <path d="M40 28h4c2 0 4 2 4 6s-2 6-4 6h-4" stroke-width="3"/>
          <!-- 스팀 -->
          <path d="M20 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/>
          <path d="M28 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/>
        </svg>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;">
          <div style="font-size: 14px; color: #ffffff;">${cachedPolygon.tradeAreaName}</div>
          <div style="font-size: 12px; color: #ffffff; font-weight: normal;">${subtitle}</div>
        </div>
      </div>`;

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
        overlay: customOverlay,
        defaultContent: content,
        centerLat: cachedPolygon.centerLat,
        centerLng: cachedPolygon.centerLng,
        polygonPaths: cachedPolygon.polygonPaths,
        tradeAreaName: cachedPolygon.tradeAreaName,
        district: cachedPolygon.district,
        dong: cachedPolygon.dong
      });

      labels.push(customOverlay);

      // 비동기로 매출/점포 데이터를 불러와 평균 매출 표시로 업데이트
      updateTradeAreaLabelSales(cachedPolygon.id, cachedPolygon.tradeAreaName, cachedPolygon.district, cachedPolygon.dong);
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
        // 캐시에서 평균 매출 즉시 표시 시도 (없으면 플레이스홀더)
        const cached2 = getSalesAndStoresFromCache(tradeArea.signgu_cd_nm, tradeArea.adstrd_cd_nm, tradeArea.trdar_cd_nm);
        const subtitle2 = cached2 != null 
          ? (cached2.total > 0 
              ? `월 ${formatAverageAmount(cached2.total)} / ${cached2.stores}개`
              : `매출 정보 없음 / ${cached2.stores}개`) 
          : '월 매출 영역';

        const content = `<div id="${currentLabelId}" class="tradearea-label" style="
          padding: 6px 12px;
          font-size: ${fontSize}px;
          font-weight: bold;
          color: #ffffff;
          text-align: center;
          white-space: nowrap;
          pointer-events: auto;
          cursor: pointer;
          text-shadow: none;
          background-color: #3288FF;
          border-radius: 6px;
          border: 1px solid rgba(50, 136, 255, 0.8);
          transition: all 0.2s ease;
          position: relative;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <svg role="img" aria-label="머그컵" xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 64 64" width="32" height="100%" 
               fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <!-- 컵 본체 -->
            <rect x="12" y="20" width="28" height="28" rx="4" stroke-width="3"/>
            <!-- 손잡이 (ㄷ자 형태) -->
            <path d="M40 28h4c2 0 4 2 4 6s-2 6-4 6h-4" stroke-width="3"/>
            <!-- 스팀 -->
            <path d="M20 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/>
            <path d="M28 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/>
          </svg>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;">
            <div style="font-size: 14px; color: #ffffff;">${tradeArea.trdar_cd_nm}</div>
            <div style="font-size: 12px; color: #ffffff; font-weight: normal;">${subtitle2}</div>
          </div>
        </div>`;

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
          overlay: customOverlay,
          defaultContent: content,
          centerLat,
          centerLng,
          polygonPaths: matchingPolygonData.polygonPaths,
          tradeAreaName: tradeArea.trdar_cd_nm,
          district: tradeArea.signgu_cd_nm,
          dong: tradeArea.adstrd_cd_nm
        });

        labels.push(customOverlay);

        // 비동기로 매출/점포 데이터를 불러와 평균 매출 표시로 업데이트
        updateTradeAreaLabelSales(currentLabelId, tradeArea.trdar_cd_nm, tradeArea.signgu_cd_nm, tradeArea.adstrd_cd_nm);
        
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