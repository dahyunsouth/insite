'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import tradeAreaData from '../../data/TradeAreaValue.json';
import tradeAreaPolygonData from '../../data/TradeAreaPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { fetchTradeAreaDetail } from '@/lib/api/tradeAreas';
import { isPointInPolygon, convertKakaoLatLngsToPoints, Point, PolygonPath } from '../../utils/pointInPolygon';

interface KakaoPolygon { setMap: (map: any) => void; setOptions: (options: any) => void; }
interface CustomOverlay { setMap: (map: any) => void; }
interface TradeAreaPoligonProps {
  onTradeAreaSelect?: (tradeAreaName: string | null, tradeAreaCode: string | null) => void;
  onShowMarketList?: (district: string, dong: string) => void;
}

export default function TradeAreaPoligon({ onTradeAreaSelect, onShowMarketList }: TradeAreaPoligonProps) {
  const { map } = useKakaoMapContext();
  const tradeAreaOverlaysRef = useRef<CustomOverlay[]>([]);
  const selectedPolygonRef = useRef<KakaoPolygon | null>(null);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, any>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);

  const formatAverageAmount = useCallback((amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억 원`;
    return `${Math.round(amount / 10000).toLocaleString()}만 원`;
  }, []);

  const hideTradeAreaItems = useCallback(() => {
    if (!isShowingRef.current) return;
    isShowingRef.current = false;
    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setMap(null);
      selectedPolygonRef.current = null;
    }
    tradeAreaOverlaysRef.current.forEach(o => o.setMap(null));
    tradeAreaOverlaysRef.current = [];
    polygonMapRef.current.clear();
  }, []);

  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return;
    const globalEventHandler = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest('.tradearea-label');
      if (!target) return;
      const labelId = target.id;
      const polygonData = polygonMapRef.current.get(labelId);
      if (!polygonData) return;
      const { polygon, centerLat, centerLng, tradeAreaName, district, dong, tradeAreaCode } = polygonData;

      if (e.type === 'click') {
        if (selectedPolygonRef.current) {
          selectedPolygonRef.current.setMap(null);
        }
        polygon.setMap(map);
        selectedPolygonRef.current = polygon;
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        onTradeAreaSelect?.(tradeAreaName, tradeAreaCode);
        onShowMarketList?.(district, dong);
      }
    };
    document.addEventListener('click', globalEventHandler, true);
    globalEventListenerRef.current = globalEventHandler;
    return () => {
      if (globalEventListenerRef.current) {
        document.removeEventListener('click', globalEventListenerRef.current, true);
        globalEventListenerRef.current = null;
      }
    };
  }, [map, onTradeAreaSelect, onShowMarketList]);

  const showTradeAreaItems = useCallback(async () => {
    if (!map || !window.kakao || isShowingRef.current) return;
    const bounds = map.getBounds();
    const LABEL_LIMIT = 25;
    isShowingRef.current = true;

    const visibleTradeAreas: any[] = [];
    tradeAreaData.DATA.forEach((tradeArea: any) => {
      const { lat, lng } = tmToWgs84(tradeArea.xcnts_value, tradeArea.ydnts_value);
      if (bounds.contain(new (window.kakao.maps as any).LatLng(lat, lng))) {
        visibleTradeAreas.push({ ...tradeArea, lat, lng, sales: 0 });
      }
    });

    const promises = visibleTradeAreas.map(area => {
      return new Promise<void>(async (resolve) => {
        try {
          const detail = await fetchTradeAreaDetail(String(area.trdar_cd));
          area.sales = detail?.sales?.thsmonSelngAmt || 0;
        } catch { area.sales = 0; }
        resolve();
      });
    });
    await Promise.all(promises);

    let tradeAreasToDisplay = visibleTradeAreas;
    if (visibleTradeAreas.length > LABEL_LIMIT) {
      tradeAreasToDisplay = visibleTradeAreas.sort((a, b) => b.sales - a.sales).slice(0, LABEL_LIMIT);
    }

    hideTradeAreaItems();
    isShowingRef.current = true;

    const newOverlays: CustomOverlay[] = [];
    const geometries = (tradeAreaPolygonData as any).geometries;

    tradeAreasToDisplay.forEach((tradeArea) => {
      const centerPoint = { lat: tradeArea.lat, lng: tradeArea.lng };
      let foundGeometry = null;
      for (const geometry of geometries) {
        if ((geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') && geometry.coordinates) {
          const pointPaths = (geometry.type === 'MultiPolygon' ? geometry.coordinates[0] : geometry.coordinates).map((ring: number[][]) => convertKakaoLatLngsToPoints(ring.map(c => { const {lat, lng} = tmToWgs84(c[0], c[1]); return new (window.kakao.maps as any).LatLng(lat, lng); })));
          if (pointPaths.some((p: PolygonPath[]) => isPointInPolygon(centerPoint, p))) {
            foundGeometry = geometry; break;
          }
        }
      }

      if (foundGeometry) {
        const polygonPaths = (foundGeometry.type === 'MultiPolygon' ? foundGeometry.coordinates[0] : foundGeometry.coordinates).map((ring: number[][]) => ring.map(c => { const {lat, lng} = tmToWgs84(c[0], c[1]); return new (window.kakao.maps as any).LatLng(lat, lng); }));
        const kakaoPolygon = new (window.kakao.maps as any).Polygon({ path: polygonPaths, strokeWeight: 2, strokeColor: '#FF0000', strokeOpacity: 1, fillColor: '#FF0000', fillOpacity: 0.2, clickable: false, zIndex: 5 });
        
        const labelId = `tradearea-label-${tradeArea.trdar_cd}`;
        const subtitle = tradeArea.sales > 0 ? `월 ${formatAverageAmount(tradeArea.sales)}` : '매출 정보 없음';
        const content = `<div id="${labelId}" class="tradearea-label" style="padding: 6px 12px; font-size: 12px; font-weight: bold; color: #ffffff; text-align: center; white-space: nowrap; pointer-events: auto; cursor: pointer; text-shadow: none; background-color: #3288FF; border-radius: 6px; border: 1px solid rgba(50, 136, 255, 0.8); transition: all 0.2s ease; position: relative; z-index: 100; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px;"><svg role="img" aria-label="머그컵" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="100%" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="20" width="28" height="28" rx="4" stroke-width="3"/><path d="M40 28h4c2 0 4 2 4 6s-2 6-4 6h-4" stroke-width="3"/><path d="M20 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/><path d="M28 12c0 2 2 2 2 4s-2 2-2 4 2 2 2 4" stroke-width="2"/></svg><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;"><div style="font-size: 14px; color: #ffffff;">${tradeArea.trdar_cd_nm}</div><div style="font-size: 12px; color: #ffffff; font-weight: normal;">${subtitle}</div></div></div>`;
        
        const customOverlay = new (window.kakao.maps as any).CustomOverlay({ map, position: new (window.kakao.maps as any).LatLng(tradeArea.lat, tradeArea.lng), content, yAnchor: 0.5, zIndex: 15 });
        newOverlays.push(customOverlay);
        polygonMapRef.current.set(labelId, { polygon: kakaoPolygon, centerLat: tradeArea.lat, centerLng: tradeArea.lng, tradeAreaName: tradeArea.trdar_cd_nm, district: tradeArea.signgu_cd_nm, dong: tradeArea.adstrd_cd_nm, tradeAreaCode: tradeArea.trdar_cd });
      }
    });
    tradeAreaOverlaysRef.current = newOverlays;
  }, [map, formatAverageAmount, hideTradeAreaItems, setupGlobalEventDelegation]);

  useEffect(() => {
    const cleanup = () => { if (isShowingRef.current) hideTradeAreaItems(); };
    window.addEventListener('hideAllLabels', cleanup);
    return () => window.removeEventListener('hideAllLabels', cleanup);
  }, [hideTradeAreaItems]);

  useEffect(() => {
    if (!map || !window.kakao) return;
    let debounceTimer: NodeJS.Timeout;
    const mapChangedListener = () => {
      const currentLevel = map.getLevel();
      if (currentLevel >= 1 && currentLevel <= 5) {
        if (!isShowingRef.current) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => showTradeAreaItems(), 100);
        }
      } else if (isShowingRef.current) {
        hideTradeAreaItems();
      }
    };
    const eventRemover = setupGlobalEventDelegation();
    (window as any).kakao.maps.event.addListener(map, 'idle', mapChangedListener);
    const initialLevel = map.getLevel();
    if (initialLevel >= 1 && initialLevel <= 5) showTradeAreaItems();
    return () => { 
      clearTimeout(debounceTimer); 
      hideTradeAreaItems();
      eventRemover();
    };
  }, [map, showTradeAreaItems, hideTradeAreaItems, setupGlobalEventDelegation]);

  return null;
}