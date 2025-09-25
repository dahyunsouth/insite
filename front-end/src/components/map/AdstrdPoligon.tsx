'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import adstrdAreaData from '../../data/AdstrdAreaValue.json';
import adstrdNameData from '../../data/AdstrdValue.json';
import seoulPolygonData from '../../data/SeoulPoligon.json';
import signGuData from '../../data/SignGuValue.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { 
  useDongMarketMode, 
  applyDongMarketModePolygonStyle,
  createDongMarketModeLabelContent,
  handleDongMarketModeHover,
  KakaoPolygon
} from './MarketMode';
import MarketModeModal from './MarketModeModal';
import { 
  applyDefaultModePolygonStyle,
  createDongDefaultModeLabelContent,
  handleDongDefaultModeHover,
  updateDongPolygonsToDefaultMode
} from './DefaultMode';

// 타입 정의
interface KakaoOverlay {
  setMap: (map: any) => void;
}

interface AdstrdPolygonProps {
  showMarketingArea?: boolean;
}

export default function AdstrdPoligon({ showMarketingArea = false }: AdstrdPolygonProps) {
  const { map } = useKakaoMapContext();
  const adstrdPolygonsRef = useRef<KakaoPolygon[]>([]);
  const adstrdLabelsRef = useRef<KakaoOverlay[]>([]);
  const eventListenersRef = useRef<(() => void)[]>([]);
  const isShowingRef = useRef<boolean>(false);
  const polygonMapRef = useRef<Map<string, {polygon: KakaoPolygon, centerLat: number, centerLng: number, dongName: string, guName: string}>>(new Map());
  const globalEventListenerRef = useRef<((e: Event) => void) | null>(null);
  const backgroundOverlayRef = useRef<KakaoOverlay | null>(null);
  
  // 행정동별 상권 모드 훅 사용
  const { dongCountData, loadDongCountData } = useDongMarketMode();
  const [dongCountCache, setDongCountCache] = useState<{[key: string]: number}>({});
  const [isLoadingAllDongs, setIsLoadingAllDongs] = useState<boolean>(false);
  const [loadingDogsCount, setLoadingDogsCount] = useState<number>(0);
  const [totalDogsCount, setTotalDogsCount] = useState<number>(0);

  // 상권 모드 상태 변화 디버깅
  useEffect(() => {
    console.log('🔍 AdstrdPoligon - showMarketingArea 상태 변화:', showMarketingArea);
  }, [showMarketingArea]);


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

  // 행정동 코드로부터 자치구명을 찾기
  const getGuNameFromDongCode = useCallback((dongCode: string): string => {
    // 행정동 코드의 첫 5자리가 자치구 코드
    const guCode = dongCode.substring(0, 5);
    
    // SignGuValue.json에서 해당 자치구 찾기
    const signGuDataTyped = signGuData as any;
    const guData = signGuDataTyped.DATA.find((gu: any) => gu.signgu_cd === guCode);
    
    console.log(`🔍 행정동 코드 "${dongCode}" -> 자치구 코드 "${guCode}" -> 자치구명 "${guData?.signgu_nm || '알 수 없음'}"`);
    
    return guData?.signgu_nm || '알 수 없음';
  }, []);

  // 좌표를 이용해서 가장 가까운 자치구명 찾기 (행정동 코드 기반)
  const findNearestGuName = useCallback((centerLat: number, centerLng: number): string => {
    const nameData = adstrdNameData as any;
    if (!nameData.DATA || !Array.isArray(nameData.DATA)) {
      return '알 수 없음';
    }

    let minDistance = Infinity;
    let nearestDongCode = '';

    nameData.DATA.forEach((district: any) => {
      // TM 좌표를 위경도로 정확한 변환
      const { lat: districtLat, lng: districtLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);

      // 거리 계산 (유클리드 거리)
      const distance = Math.sqrt(
        Math.pow(centerLat - districtLat, 2) + Math.pow(centerLng - districtLng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestDongCode = district.adstrd_cd || '';
      }
    });

    // 행정동 코드로부터 자치구명 추출
    return getGuNameFromDongCode(nearestDongCode);
  }, [getGuNameFromDongCode]);

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
      console.log(`🖱️ 이벤트 감지: ${e.type}, 타겟:`, target, `클래스:`, target?.classList);
      
      if (!target || !target.classList || !target.classList.contains('adstrd-label')) {
        console.log(`❌ 행정동 라벨이 아님: ${target?.className}`);
        return;
      }

      const labelId = target.id;
      console.log(`🎯 행정동 라벨 이벤트: ${e.type}, ID: ${labelId}`);
      
      const polygonData = polygonMapRef.current.get(labelId);
      if (!polygonData) {
        console.log(`❌ 폴리곤 데이터 없음: ${labelId}`);
        return;
      }

      const { polygon, centerLat, centerLng, dongName, guName } = polygonData;
      console.log(`📍 폴리곤 데이터: ${dongName} (${guName}), 좌표: ${centerLat}, ${centerLng}`);

      if (e.type === 'mouseenter') {
        // 현재 상권 모드 상태를 실시간으로 확인
        const isMarketingMode = showMarketingArea;
        
        if (isMarketingMode) {
          const dongKey = `${guName}-${dongName}`;
          const count = dongCountCache[dongKey] || 0;
          handleDongMarketModeHover(polygon, dongName, count, true);
        } else {
          handleDongDefaultModeHover(polygon, dongName, true);
        }
      } else if (e.type === 'mouseleave') {
        // 현재 상권 모드 상태를 실시간으로 확인
        const isMarketingMode = showMarketingArea;
        
        if (isMarketingMode) {
          const dongKey = `${guName}-${dongName}`;
          const count = dongCountCache[dongKey] || 0;
          handleDongMarketModeHover(polygon, dongName, count, false);
        } else {
          handleDongDefaultModeHover(polygon, dongName, false);
        }
      } else if (e.type === 'click') {
        console.log(`🎯 행정동 클릭: ${dongName}`);
        
        // 지도 중심 이동 및 확대
        map.setCenter(new (window.kakao.maps as any).LatLng(centerLat, centerLng));
        map.setLevel(5);
      }
    };

    document.addEventListener('mouseenter', globalEventHandler, true);
    document.addEventListener('mouseleave', globalEventHandler, true);
    document.addEventListener('click', globalEventHandler, true);
    
    globalEventListenerRef.current = globalEventHandler;
  }, [map, showMarketingArea, dongCountCache]);

  // 행정동별 폴리곤과 라벨 숨김 함수 (고성능 최적화)
  const hideAdstrdPolygons = useCallback(() => {
    if (!isShowingRef.current) return;

    console.log(`🗑️ 행정동 폴리곤 정리 시작 - 현재 폴리곤: ${adstrdPolygonsRef.current.length}개, 라벨: ${adstrdLabelsRef.current.length}개`);

    // 즉시 상태 변경으로 중복 실행 방지
    isShowingRef.current = false;
    
    // 배경 오버레이 숨김
    hideBackgroundOverlay();
    
    // 폴리곤 맵 정리
    polygonMapRef.current.clear();
    
    // 전역 이벤트 리스너 정리
    if (globalEventListenerRef.current) {
      document.removeEventListener('mouseenter', globalEventListenerRef.current, true);
      document.removeEventListener('mouseleave', globalEventListenerRef.current, true);
      document.removeEventListener('click', globalEventListenerRef.current, true);
      globalEventListenerRef.current = null;
    }

    // 병렬 처리로 빠른 제거
    const polygons = adstrdPolygonsRef.current;
    const labels = adstrdLabelsRef.current;
    
    // 즉시 제거 (requestAnimationFrame 없이)
    polygons.forEach(polygon => polygon.setMap(null));
    labels.forEach(label => label.setMap(null));
    
    // 참조 즉시 정리
    adstrdPolygonsRef.current = [];
    adstrdLabelsRef.current = [];
    eventListenersRef.current = [];
    
    console.log(`✅ 행정동 폴리곤 정리 완료`);
  }, [hideBackgroundOverlay]);

  // 행정동별 폴리곤과 라벨 표시 함수 (레벨 6)
  const showAdstrdPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) {
      console.log(`⚠️ showAdstrdPolygons 중단: map=${!!map}, kakao=${!!window.kakao}, isShowing=${isShowingRef.current}`);
      return;
    }

    console.log(`🎨 행정동 폴리곤 생성 시작 - 상권모드: ${showMarketingArea}`);

    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    // 배경 오버레이 표시
    showBackgroundOverlay();
    
    isShowingRef.current = true;

    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const eventCleanups: (() => void)[] = [];
    
    // 레벨 6일 때 글자 크기 설정
    const fontSize = 14; // 행정동은 더 작게

    // 폴리곤 데이터 처리 - GeometryCollection 형태의 데이터
    const geometryCollection = adstrdAreaData as any;
    if (geometryCollection.geometries && Array.isArray(geometryCollection.geometries)) {
      
      // 상권 모드일 때 총 행정동 개수 설정 및 로딩 시작
      if (showMarketingArea) {
        const totalCount = geometryCollection.geometries.length;
        setTotalDogsCount(totalCount);
        setIsLoadingAllDongs(true);
        console.log(`📊 총 행정동 개수: ${totalCount}개 - 로딩 시작`);
      }
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

        // 행정동 이름과 자치구명 찾기
        const dongName = findNearestAdstrdName(centerLat, centerLng);
        const guName = findNearestGuName(centerLat, centerLng);
        const currentLabelId = `adstrd-label-${index}`;
        
        console.log(`📍 좌표 (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}) -> 자치구: "${guName}", 행정동: "${dongName}"`);
        
        // 상권 모드에서 상권 개수 로드 및 캐시
        let content = '';
        if (showMarketingArea) {
          console.log(`🎯 행정동 상권모드 처리: "${guName}" "${dongName}"`);
          // 상권 개수 비동기 로드
          const dongKey = `${guName}-${dongName}`;
          let count = dongCountCache[dongKey];
          
          if (count === undefined) {
            console.log(`🔄 행정동 데이터 로드 필요: ${dongKey}`);
            
            // 로딩 카운터 증가
            setLoadingDogsCount(prev => prev + 1);
            setIsLoadingAllDongs(true);
            
            // 아직 로드되지 않은 경우 비동기 로드
            loadDongCountData(guName, dongName).then((loadedCount) => {
              console.log(`✅ 행정동 데이터 로드 완료: ${dongKey} = ${loadedCount}개`);
              setDongCountCache(prev => ({
                ...prev,
                [dongKey]: loadedCount
              }));
              
              // 로딩 카운터 감소
              setLoadingDogsCount(prev => {
                const newCount = prev - 1;
                if (newCount <= 0) {
                  setIsLoadingAllDongs(false);
                }
                return newCount;
              });
              
              // 폴리곤 스타일 업데이트
              applyDongMarketModePolygonStyle(kakaoPolygon, loadedCount);
              
              // 라벨 업데이트
              const labelElement = document.getElementById(currentLabelId);
              if (labelElement) {
                labelElement.outerHTML = createDongMarketModeLabelContent(dongName, loadedCount, currentLabelId, fontSize, true);
              }
            });
            count = 0; // 로딩 중에는 0으로 표시
          } else {
            console.log(`💾 행정동 캐시된 데이터 사용: ${dongKey} = ${count}개`);
          }
          
          content = createDongMarketModeLabelContent(dongName, count, currentLabelId, fontSize, true);
          applyDongMarketModePolygonStyle(kakaoPolygon, count);
        } else {
          console.log(`🔵 행정동 기본모드 처리: ${dongName}`);
          content = createDongDefaultModeLabelContent(dongName, currentLabelId, fontSize);
          applyDefaultModePolygonStyle(kakaoPolygon);
        }

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
          centerLng,
          dongName,
          guName
        });

        labels.push(customOverlay);
      }
      });
    }

    adstrdPolygonsRef.current = polygons;
    adstrdLabelsRef.current = labels;
    eventListenersRef.current = eventCleanups;
    
    console.log(`✅ 행정동 폴리곤 생성 완료 - 폴리곤: ${polygons.length}개, 라벨: ${labels.length}개`);
    
    // 기본 모드일 때는 로딩 즉시 완료
    if (!showMarketingArea) {
      setIsLoadingAllDongs(false);
    }
  }, [map, findNearestAdstrdName, findNearestGuName, setupGlobalEventDelegation, showBackgroundOverlay]);

  // 상권 모드 변경 시 폴리곤 업데이트
  useEffect(() => {
    if (!isShowingRef.current) return;

    console.log(`🔄 AdstrdPoligon 모드 변경 - 상권모드: ${showMarketingArea}`);
    
    // 상권 모드 변경 시 이벤트 핸들러만 재설정 (폴리곤 재생성 없이)
    if (globalEventListenerRef.current) {
      document.removeEventListener('mouseenter', globalEventListenerRef.current, true);
      document.removeEventListener('mouseleave', globalEventListenerRef.current, true);
      document.removeEventListener('click', globalEventListenerRef.current, true);
      globalEventListenerRef.current = null;
    }
    setupGlobalEventDelegation();

    // 기존 폴리곤들의 스타일만 업데이트 (재생성하지 않음)
    if (showMarketingArea) {
      console.log('🎯 기존 행정동 폴리곤들을 상권 모드로 업데이트');
      setIsLoadingAllDongs(true); // 로딩 시작
      
      let pendingLoads = 0;
      
      // 각 폴리곤을 상권 모드 스타일로 업데이트
      adstrdPolygonsRef.current.forEach((polygon, index) => {
        const geometryCollection = adstrdAreaData as any;
        if (geometryCollection.geometries && geometryCollection.geometries[index]) {
          // 중심점 재계산
          const coords = geometryCollection.geometries[index].coordinates[0];
          let centerLat = 0;
          let centerLng = 0;
          coords.forEach((coord: number[]) => {
            const { lat, lng } = tmToWgs84(coord[0], coord[1]);
            centerLat += lat;
            centerLng += lng;
          });
          centerLat = centerLat / coords.length;
          centerLng = centerLng / coords.length;
          
          const dongName = findNearestAdstrdName(centerLat, centerLng);
          const guName = findNearestGuName(centerLat, centerLng);
          const dongKey = `${guName}-${dongName}`;
          let count = dongCountCache[dongKey];
          
          if (count === undefined) {
            // 데이터가 없으면 로드
            pendingLoads++;
            loadDongCountData(guName, dongName).then((loadedCount) => {
              setDongCountCache(prev => ({
                ...prev,
                [dongKey]: loadedCount
              }));
              
              // 폴리곤 스타일 업데이트
              applyDongMarketModePolygonStyle(polygon, loadedCount);
              
              // 라벨 업데이트
              const currentLabelId = `adstrd-label-${index}`;
              const labelElement = document.getElementById(currentLabelId);
              if (labelElement) {
                labelElement.outerHTML = createDongMarketModeLabelContent(dongName, loadedCount, currentLabelId, 14, true);
              }
              if (labelElement) {
                labelElement.outerHTML = createDongMarketModeLabelContent(dongName, loadedCount, currentLabelId, 14, true);
              }
              
              // 로딩 완료 체크
              pendingLoads--;
              if (pendingLoads <= 0) {
                setIsLoadingAllDongs(false);
              }
            });
            count = 0; // 임시로 0
          } else {
            count = dongCountCache[dongKey];
          }
          
          // 폴리곤 스타일 업데이트
          applyDongMarketModePolygonStyle(polygon, count);
          
          // 라벨 업데이트
          const currentLabelId = `adstrd-label-${index}`;
          const labelElement = document.getElementById(currentLabelId);
          if (labelElement) {
            labelElement.outerHTML = createDongMarketModeLabelContent(dongName, count, currentLabelId, 14, true);
          }
        }
      });
      
      // 모든 데이터가 캐시되어 있으면 로딩 즉시 완료
      if (pendingLoads === 0) {
        setIsLoadingAllDongs(false);
      }
    } else {
      console.log('🔵 기존 행정동 폴리곤들을 기본 모드로 업데이트');
      // 행정동용 기본 모드 업데이트 함수 사용
      updateDongPolygonsToDefaultMode(adstrdPolygonsRef.current, adstrdLabelsRef.current);
    }
  }, [showMarketingArea, setupGlobalEventDelegation, dongCountCache, findNearestAdstrdName, findNearestGuName]);

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
        console.log(`✅ 레벨 6 - 행정동 폴리곤 표시 준비`);
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

  return (
    <>
      {/* 행정동 상권 모드 로딩 모달 */}
      <MarketModeModal isLoading={showMarketingArea && isLoadingAllDongs} />
    </>
  );
}
