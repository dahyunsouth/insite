'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import adstrdAreaData from '../../data/AdstrdAreaValue.json';
import adstrdNameData from '../../data/AdstrdValue.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { 
  useDongMarketMode, 
  applyDongMarketModePolygonStyle,
  createDongMarketModeLabelContent,
  KakaoPolygon
} from './MarketMode';
import MarketModeModal from './MarketModeModal';
import { 
  applyDefaultModePolygonStyle,
  createDongDefaultModeLabelContent
} from './DefaultMode';

interface CustomOverlay {
  setMap: (map: any) => void;
}

interface AdstrdPolygonProps {
  showMarketingArea?: boolean;
}

export default function AdstrdPoligon({ showMarketingArea = false }: AdstrdPolygonProps) {
  const { map } = useKakaoMapContext();
  const adstrdPolygonsRef = useRef<KakaoPolygon[]>([]);
  const selectedPolygonRef = useRef<KakaoPolygon | null>(null);
  const adstrdOverlaysRef = useRef<CustomOverlay[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number, dongName: string, guName: string}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);

  const { dongCountData, loadDongCountData } = useDongMarketMode();
  const [dongCountCache, setDongCountCache] = useState<{[key: string]: number}>({});
  const [isLoadingAllDongs, setIsLoadingAllDongs] = useState<boolean>(false);

  const findNearestAdstrdName = useCallback((centerLat: number, centerLng: number): string => {
    const nameData = adstrdNameData as any;
    if (!nameData.DATA || !Array.isArray(nameData.DATA)) return '알 수 없음';
    let minDistance = Infinity;
    let nearestName = '알 수 없음';
    nameData.DATA.forEach((district: any) => {
      const { lat: districtLat, lng: districtLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);
      const distance = Math.sqrt(Math.pow(centerLat - districtLat, 2) + Math.pow(centerLng - districtLng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestName = district.adstrd_nm || '알 수 없음';
      }
    });
    return nearestName;
  }, []);

  const findNearestGuName = useCallback((centerLat: number, centerLng: number): string => {
    const nameData = adstrdNameData as any;
    if (!nameData.DATA || !Array.isArray(nameData.DATA)) return '알 수 없음';
    let minDistance = Infinity;
    let nearestDongCode = '';
    nameData.DATA.forEach((district: any) => {
      const { lat: districtLat, lng: districtLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);
      const distance = Math.sqrt(Math.pow(centerLat - districtLat, 2) + Math.pow(centerLng - districtLng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestDongCode = district.adstrd_cd || '';
      }
    });
    const guCode = nearestDongCode.substring(0, 5);
    const guData = (adstrdNameData as any).DATA.find((d: any) => d.adstrd_cd.substring(0, 5) === guCode);
    return guData?.signgu_nm || '알 수 없음';
  }, []);

  const hideAdstrdItems = useCallback(() => {
    if (!isShowingRef.current) return;
    isShowingRef.current = false;
    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setMap(null);
      selectedPolygonRef.current = null;
    }
    adstrdPolygonsRef.current.forEach(p => p.setMap(null));
    adstrdOverlaysRef.current.forEach(o => o.setMap(null));
    adstrdPolygonsRef.current = [];
    adstrdOverlaysRef.current = [];
    polygonMapRef.current.clear();
  }, []);

  const setupGlobalEventDelegation = useCallback(() => {
    if (globalEventListenerRef.current) return;
    const globalEventHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target?.closest('.adstrd-label')) return;
      const labelId = target.closest('.adstrd-label')!.id;
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
        map.setLevel(5);
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

  const showAdstrdItems = useCallback(async () => {
    if (!map || !window.kakao || isShowingRef.current) return;
    const bounds = map.getBounds();
    const LABEL_LIMIT = 20;
    isShowingRef.current = true;

    const visibleDongs: any[] = [];
    const geometryCollection = adstrdAreaData as any;
    if (geometryCollection.geometries && Array.isArray(geometryCollection.geometries)) {
      geometryCollection.geometries.forEach((polygon: any) => {
        if (polygon.type === 'Polygon' && polygon.coordinates?.[0]) {
          const coordinates = polygon.coordinates[0].map((coord: number[]) => {
            const { lat, lng } = tmToWgs84(coord[0], coord[1]);
            return new (window.kakao.maps as any).LatLng(lat, lng);
          });
          let centerLat = 0, centerLng = 0;
          coordinates.forEach((coord: any) => { centerLat += coord.getLat(); centerLng += coord.getLng(); });
          centerLat /= coordinates.length;
          centerLng /= coordinates.length;
          const center = new (window.kakao.maps as any).LatLng(centerLat, centerLng);
          if (bounds.contain(center)) {
            const dongName = findNearestAdstrdName(centerLat, centerLng);
            const guName = findNearestGuName(centerLat, centerLng);
            visibleDongs.push({ coordinates, center, centerLat, centerLng, dongName, guName, tradeAreaCount: 0 });
          }
        }
      });
    }

    if (showMarketingArea) {
      setIsLoadingAllDongs(true);
      const promises = visibleDongs.map(dong => {
        const dongKey = `${dong.guName}-${dong.dongName}`;
        const cachedCount = dongCountCache[dongKey];
        if (cachedCount !== undefined) {
          dong.tradeAreaCount = cachedCount;
          return Promise.resolve();
        } else {
          return loadDongCountData(dong.guName, dong.dongName).then(count => {
            dong.tradeAreaCount = count;
            setDongCountCache(prev => ({ ...prev, [dongKey]: count }));
          });
        }
      });
      await Promise.all(promises);
      setIsLoadingAllDongs(false);
    }

    let dongsToDisplay = visibleDongs;
    if (showMarketingArea && visibleDongs.length > LABEL_LIMIT) {
      dongsToDisplay = visibleDongs.sort((a, b) => b.tradeAreaCount - a.tradeAreaCount).slice(0, LABEL_LIMIT);
    }

    hideAdstrdItems();
    isShowingRef.current = true;

    const newPolygons: KakaoPolygon[] = [];
    const newOverlays: CustomOverlay[] = [];
    const fontSize = 14;

    dongsToDisplay.forEach((dong, index) => {
      const kakaoPolygon = new (window.kakao.maps as any).Polygon({
        path: dong.coordinates, strokeWeight: 1, strokeColor: '#3288FF', strokeOpacity: 0.6,
        fillColor: '#3288FF', fillOpacity: 0, clickable: false, zIndex: 0
      });
      newPolygons.push(kakaoPolygon);

      const currentLabelId = `adstrd-label-${dong.guName}-${dong.dongName}-${index}`;
      let content = '';
      if (showMarketingArea) {
        content = createDongMarketModeLabelContent(dong.dongName, dong.tradeAreaCount, currentLabelId, fontSize, true);
        applyDongMarketModePolygonStyle(kakaoPolygon, dong.tradeAreaCount);
      } else {
        content = createDongDefaultModeLabelContent(dong.dongName, currentLabelId, fontSize);
        applyDefaultModePolygonStyle(kakaoPolygon);
      }

      const customOverlay = new (window.kakao.maps as any).CustomOverlay({ map, position: dong.center, content, yAnchor: 0.5 });
      newOverlays.push(customOverlay);
      polygonMapRef.current.set(currentLabelId, { polygon: kakaoPolygon, centerLat: dong.centerLat, centerLng: dong.centerLng, dongName: dong.dongName, guName: dong.guName });
    });

    adstrdPolygonsRef.current = newPolygons;
    adstrdOverlaysRef.current = newOverlays;
  }, [map, findNearestAdstrdName, findNearestGuName, showMarketingArea, dongCountCache, loadDongCountData, setDongCountCache, hideAdstrdItems]);

  useEffect(() => {
    if (!map || !window.kakao) return;
    let debounceTimer: NodeJS.Timeout;
    const zoomChangedListener = () => {
      const currentLevel = map.getLevel();
      if (currentLevel === 6 && !isShowingRef.current) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => showAdstrdItems(), 50);
      } else if (currentLevel !== 6 && isShowingRef.current) {
        hideAdstrdItems();
      }
    };
    const eventRemover = setupGlobalEventDelegation();
    window.kakao.maps.event.addListener(map, 'idle', zoomChangedListener);
    const initialLevel = map.getLevel();
    if (initialLevel === 6) showAdstrdItems();
    return () => { 
      clearTimeout(debounceTimer); 
      hideAdstrdItems();
      eventRemover();
    };
  }, [map, hideAdstrdItems, showAdstrdItems, setupGlobalEventDelegation]);

  useEffect(() => {
    const cleanup = () => { if (isShowingRef.current) hideAdstrdItems(); };
    window.addEventListener('hideAllLabels', cleanup);
    return () => window.removeEventListener('hideAllLabels', cleanup);
  }, [hideAdstrdItems]);

  return (
    <>
      <MarketModeModal isLoading={showMarketingArea && isLoadingAllDongs} />
    </>
  );
}