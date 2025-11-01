'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import signGuData from '../../data/SignGuValue.json';
import signGuPolygonData from '../../data/SignGuPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { 
  useMarketMode, 
  applyMarketModePolygonStyle, 
  createMarketModeLabelContent, 
  KakaoPolygon
} from './MarketMode';
import MarketModeModal from './MarketModeModal';
import { 
  applyDefaultModePolygonStyle, 
  createDefaultModeLabelContent 
} from './DefaultMode';

interface CustomOverlay {
  setMap: (map: any) => void;
}

interface SignGuPolygonProps {
  showMarketingArea?: boolean;
}

export default function SignGuPoligon({ showMarketingArea = false }: SignGuPolygonProps) {
  const { map } = useKakaoMapContext();
  const signGuPolygonsRef = useRef<KakaoPolygon[]>([]);
  const selectedPolygonRef = useRef<KakaoPolygon | null>(null);
  const signGuOverlaysRef = useRef<CustomOverlay[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number, guName: string}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);

  const { guCountData, isLoadingData, loadGuCountData } = useMarketMode();

  useEffect(() => {
    if (showMarketingArea && Object.keys(guCountData).length === 0) {
      loadGuCountData();
    }
  }, [showMarketingArea, guCountData, loadGuCountData]);

  const hideSignGuItems = useCallback(() => {
    if (!isShowingRef.current) return;
    isShowingRef.current = false;
    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setMap(null);
      selectedPolygonRef.current = null;
    }
    signGuPolygonsRef.current.forEach(p => p.setMap(null));
    signGuOverlaysRef.current.forEach(o => o.setMap(null));
    signGuPolygonsRef.current = [];
    signGuOverlaysRef.current = [];
    polygonMapRef.current.clear();
  }, []);

  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return;
    const globalEventHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target?.closest('.signgu-label')) return;
      const labelId = target.closest('.signgu-label')!.id;
      const polygonData = polygonMapRef.current.get(labelId);
      if (!polygonData) return;
      const { polygon, centerLat, centerLng } = polygonData;

      if (e.type === 'click') {
        if (selectedPolygonRef.current) {
          selectedPolygonRef.current.setMap(null);
        }
        polygon.setMap(map);
        selectedPolygonRef.current = polygon;
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        map.setLevel(6);
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
  }, [map]);

  const showSignGuItems = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;
    const bounds = map.getBounds();
    if (showMarketingArea && Object.keys(guCountData).length === 0 && !isLoadingData) {
      loadGuCountData().then(() => { if (!isShowingRef.current) showSignGuItems(); });
      return;
    }
    isShowingRef.current = true;

    const newPolygons: KakaoPolygon[] = [];
    const newOverlays: CustomOverlay[] = [];
    const currentLevel = map.getLevel();
    const fontSize = 14;
    const showCount = currentLevel >= 7 && currentLevel <= 8;
    const geometries = signGuPolygonData.geometries;
    if (!geometries || geometries.length === 0) return;

    hideSignGuItems();
    isShowingRef.current = true;

    geometries.forEach((geometry: any, index: number) => {
      if (geometry.type === 'Polygon' && geometry.coordinates) {
        const polygonPaths: any[] = [];
        geometry.coordinates.forEach((ring: number[][]) => {
          const path = ring.map((coord: number[]) => {
            const { lat, lng } = tmToWgs84(coord[0], coord[1]);
            return new (window.kakao.maps as any).LatLng(lat, lng);
          });
          polygonPaths.push(path);
        });

        const kakaoPolygon = new (window.kakao.maps as any).Polygon({
          path: polygonPaths, strokeWeight: 1, strokeColor: '#3288FF', strokeOpacity: 1,
          fillColor: '#3288FF', fillOpacity: 0, clickable: false, zIndex: 1
        });
        newPolygons.push(kakaoPolygon);

        const district = signGuData.DATA[index];
        if (district) {
          const guName = district.signgu_nm;
          showMarketingArea ? applyMarketModePolygonStyle(kakaoPolygon, guName, guCountData) : applyDefaultModePolygonStyle(kakaoPolygon);
          const { lat: centerLat, lng: centerLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);
          const position = new (window.kakao.maps as any).LatLng(centerLat, centerLng);

          if (bounds.contain(position)) {
            const currentLabelId = `signgu-label-${index}`;
            const content = showMarketingArea 
              ? createMarketModeLabelContent(guName, guCountData, currentLabelId, fontSize, showCount)
              : createDefaultModeLabelContent(guName, currentLabelId, fontSize);
            
            const customOverlay = new (window.kakao.maps as any).CustomOverlay({ map, position, content, yAnchor: 0.5 });
            newOverlays.push(customOverlay);
            polygonMapRef.current.set(currentLabelId, { polygon: kakaoPolygon, centerLat, centerLng, guName: district.signgu_nm });
          }
        }
      }
    });
    signGuPolygonsRef.current = newPolygons;
    signGuOverlaysRef.current = newOverlays;
  }, [map, showMarketingArea, guCountData, loadGuCountData, isLoadingData, hideSignGuItems]);

  useEffect(() => {
    if (showMarketingArea && Object.keys(guCountData).length > 0 && isShowingRef.current) {
      hideSignGuItems();
      setTimeout(() => {
        const currentLevel = map.getLevel();
        if (currentLevel >= 7 && currentLevel <= 8) showSignGuItems();
      }, 50);
    }
  }, [guCountData, showMarketingArea, map, hideSignGuItems, showSignGuItems]);

  useEffect(() => {
    const cleanup = () => { if (isShowingRef.current) hideSignGuItems(); };
    window.addEventListener('hideAllLabels', cleanup);
    return () => window.removeEventListener('hideAllLabels', cleanup);
  }, [hideSignGuItems]);

  useEffect(() => {
    if (!map || !window.kakao) return;
    let debounceTimer: NodeJS.Timeout;
    const zoomChangedListener = () => {
      const currentLevel = map.getLevel();
      if (currentLevel >= 7 && currentLevel <= 8) {
        if (!isShowingRef.current) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => showSignGuItems(), 50);
        }
      } else if (isShowingRef.current) {
        hideSignGuItems();
      }
    };
    const eventRemover = setupGlobalEventDelegation();
    window.kakao.maps.event.addListener(map, 'idle', zoomChangedListener);
    const initialLevel = map.getLevel();
    if (initialLevel >= 7 && initialLevel <= 8) showSignGuItems();
    return () => { 
      clearTimeout(debounceTimer); 
      hideSignGuItems();
      eventRemover();
    };
  }, [map, hideSignGuItems, showSignGuItems, setupGlobalEventDelegation]);

  return (
    <>
      <MarketModeModal isLoading={showMarketingArea && isLoadingData} />
    </>
  );
}