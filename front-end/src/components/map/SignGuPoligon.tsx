'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useKakaoMapContext } from './KakaoMap';
import signGuData from '../../data/SignGuValue.json';
import signGuPolygonData from '../../data/SignGuPoligon.json';
import { tmToWgs84 } from '../../utils/coordinateTransform';
import { getColorByCount, addOpacityToColor, darkenColor } from '../../utils/marketingAreaColors';
import { API_ENDPOINTS } from '../../config/api';

// 타입 정의
interface KakaoPolygon {
  setMap: (map: any) => void;
  setOptions: (options: any) => void;
  getOptions?: () => any;
}

interface KakaoOverlay {
  setMap: (map: any) => void;
}

interface GuCountData {
  [guName: string]: number;
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
  const [guCountData, setGuCountData] = useState<GuCountData>({});
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // 자치구별 상권 개수 데이터 로드
  const loadGuCountData = useCallback(async () => {
    if (isLoadingData) return;
    
    setIsLoadingData(true);
    const countData: GuCountData = {};
    
    try {
      // 모든 자치구에 대해 병렬로 API 호출
      const promises = signGuData.DATA.map(async (district: any) => {
        try {
          const response = await fetch(`${API_ENDPOINTS.COUNT_BY_GU}?district=${encodeURIComponent(district.signgu_nm)}`);
          if (response.ok) {
            const data = await response.json();
            return { guName: district.signgu_nm, count: data.result?.count || 0 };
          } else {
            console.warn(`Failed to load data for ${district.signgu_nm}:`, response.status, response.statusText);
            return { guName: district.signgu_nm, count: 0 };
          }
        } catch (error) {
          console.warn(`Error loading data for ${district.signgu_nm}:`, error);
          return { guName: district.signgu_nm, count: 0 };
        }
      });

      const results = await Promise.all(promises);
      
      // 결과를 GuCountData 객체로 변환
      results.forEach(result => {
        countData[result.guName] = result.count;
      });
      
      setGuCountData(countData);
      console.log('구별 상권 개수 데이터 로드 완료:', countData);
      
    } catch (error) {
      console.error('Error loading gu count data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isLoadingData]);

  // showMarketingArea가 true일 때 데이터 로드
  useEffect(() => {
    if (showMarketingArea && Object.keys(guCountData).length === 0) {
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
        console.log(`🎯 ${guName} hover 시작: 상권모드=${isMarketingMode}`);
        
        if (isMarketingMode) {
          // 상권 모드: 배경 불투명도만 20%로 증가, 색상은 유지
          polygon.setOptions({
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeOpacity: 1
          });
        } else {
          // 일반 모드: 파란색 hover 효과
          polygon.setOptions({
            fillOpacity: 0.5,
            strokeWeight: 2,
            strokeOpacity: 1
          });
        }
      } else if (e.type === 'mouseleave') {
        // 현재 상권 모드 상태를 실시간으로 확인
        const isMarketingMode = showMarketingArea;
        console.log(`🔄 ${guName} hover 해제: 상권모드=${isMarketingMode}`);
        
        if (isMarketingMode) {
          // 상권 모드일 때: 각 구의 원래 상권 색상으로 복원
          const count = guCountData[guName] || 0;
          const baseColor = getColorByCount(count);
          const fillOpacity = count >= 5 ? 0.1 : 0;
          
          console.log(`  → ${guName} 복원: count=${count}, color=${baseColor}, opacity=${fillOpacity}`);
          
          polygon.setOptions({
            strokeColor: baseColor,
            fillColor: baseColor,
            fillOpacity: fillOpacity,
            strokeWeight: 1,
            strokeOpacity: 1
          });
        } else {
          // 일반 모드일 때: 기본 파란색으로 복원
          console.log(`  → ${guName} 일반모드 복원`);
          polygon.setOptions({
            strokeColor: '#3288FF',
            fillColor: '#3288FF',
            fillOpacity: 0,
            strokeWeight: 1,
            strokeOpacity: 1
          });
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
        console.log('🎯 상권 모드 활성화 - 폴리곤 색상 업데이트');
        
        signGuPolygonsRef.current.forEach((polygon, index) => {
          const district = signGuData.DATA[index];
          if (district) {
            const guName = district.signgu_nm;
            const count = guCountData[guName] || 0;
            const baseColor = getColorByCount(count);
            const fillOpacity = count >= 5 ? 0.1 : 0;
            
            polygon.setOptions({
              strokeColor: baseColor,
              fillColor: baseColor,
              fillOpacity: fillOpacity,
            });
            
            console.log(`  ${guName}: ${count}개 -> ${baseColor} (opacity: ${fillOpacity})`);
          }
        });
        
        // 라벨도 상권 모드 스타일로 업데이트
        signGuLabelsRef.current.forEach((label, index) => {
          const district = signGuData.DATA[index];
          if (district) {
            const guName = district.signgu_nm;
            const count = guCountData[guName] || 0;
            const baseColor = getColorByCount(count);
            const labelBackgroundColor = addOpacityToColor(baseColor, 0.9);
            const labelBorderColor = addOpacityToColor(baseColor, 0.8);
            const hoverBackgroundColor = darkenColor(baseColor, 0.2);
            
            const currentLabelId = `signgu-label-${index}`;
            const labelElement = document.getElementById(currentLabelId);
            if (labelElement) {
              labelElement.style.backgroundColor = labelBackgroundColor;
              labelElement.style.borderColor = labelBorderColor;
              labelElement.style.color = '#ffffff';
              labelElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
              
              // hover 이벤트 업데이트
              labelElement.setAttribute('onmouseover', 
                `this.style.backgroundColor='${hoverBackgroundColor}'; this.style.borderColor='${hoverBackgroundColor}'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1.1)'`
              );
              labelElement.setAttribute('onmouseout', 
                `this.style.backgroundColor='${labelBackgroundColor}'; this.style.borderColor='${labelBorderColor}'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1)'`
              );
            }
          }
        });
      }
    } else {
      // 상권 모드 OFF: 기본 상태로 복원
      console.log('🔄 상권 모드 비활성화 - 기본 상태로 복원');
      
      signGuPolygonsRef.current.forEach((polygon) => {
        polygon.setOptions({
          strokeColor: '#3288FF',
          fillColor: '#3288FF',
          fillOpacity: 0,
        });
      });
      
      // 라벨도 기본 스타일로 복원
      signGuLabelsRef.current.forEach((label, index) => {
        const currentLabelId = `signgu-label-${index}`;
        const labelElement = document.getElementById(currentLabelId);
        if (labelElement) {
          labelElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          labelElement.style.borderColor = 'rgba(50, 136, 255, 0.8)';
          labelElement.style.color = '#000000';
          labelElement.style.textShadow = 'none';
        }
      });
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
  }, []);

  // 구별 폴리곤과 라벨 표시 함수 (레벨 7~8)
  const showSignGuPolygons = useCallback(() => {
    if (!map || !window.kakao || isShowingRef.current) return;

    // 전역 이벤트 위임 설정
    setupGlobalEventDelegation();
    
    isShowingRef.current = true;

    const polygons: KakaoPolygon[] = [];
    const labels: KakaoOverlay[] = [];
    const eventCleanups: (() => void)[] = [];
    
    // 레벨 7~8일 때 글자 크기 설정
    const fontSize = 14; // 구별은 크게

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
          // 상권 개수에 따른 색상 결정
          const guName = district.signgu_nm;
          const count = guCountData[guName] || 0;
          const baseColor = showMarketingArea ? getColorByCount(count) : '#3288FF';
          const strokeColor = baseColor;
          const fillColor = baseColor;
          const fillOpacity = showMarketingArea ? 0.1 : 0;

          // 폴리곤 색상 업데이트
          kakaoPolygon.setOptions({
            strokeColor: strokeColor,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
          });

          // 구 중심 좌표로 라벨 위치 설정 (정확한 TM->WGS84 변환)
          const { lat: centerLat, lng: centerLng } = tmToWgs84(district.xcnts_value, district.ydnts_value);
          const position = new (window.kakao.maps as any).LatLng(centerLat, centerLng);

          // 구 이름 라벨 생성
          const currentLabelId = `signgu-label-${index}`;
          const labelBackgroundColor = showMarketingArea ? addOpacityToColor(baseColor, 0.9) : 'rgba(255, 255, 255, 0.9)';
          const labelBorderColor = showMarketingArea ? addOpacityToColor(baseColor, 0.8) : 'rgba(50, 136, 255, 0.8)';
          
          // hover 시 배경색: 상권 모드일 때는 더 진한 색상, 일반 모드일 때는 파란색
          const hoverBackgroundColor = showMarketingArea ? darkenColor(baseColor, 0.2) : 'rgba(50, 136, 255, 0.9)';
          
          const textColor = showMarketingArea ? '#ffffff' : '#000000';
          const textShadow = showMarketingArea ? '1px 1px 2px rgba(0,0,0,0.7)' : 'none';
          
          const content = `<div id="${currentLabelId}" class="signgu-label" style="
            padding: 6px 12px;
            font-size: ${fontSize}px;
            font-weight: bold;
            color: ${textColor};
            text-align: center;
            white-space: nowrap;
            pointer-events: auto;
            cursor: pointer;
            text-shadow: ${textShadow};
            background-color: ${labelBackgroundColor};
            border-radius: 8px;
            border: 2px solid ${labelBorderColor};
            transition: all 0.2s ease;
          " onmouseover="this.style.backgroundColor='${hoverBackgroundColor}'; this.style.borderColor='${hoverBackgroundColor}'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1.1)'" 
             onmouseout="this.style.backgroundColor='${labelBackgroundColor}'; this.style.borderColor='${labelBorderColor}'; this.style.color='${textColor}'; this.style.textShadow='${textShadow}'; this.style.transform='scale(1)'"
          >${district.signgu_nm}</div>`;

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
  }, [map, setupGlobalEventDelegation, showMarketingArea, guCountData]);

  useEffect(() => {
    if (!map || !window.kakao) return;

    let debounceTimer: NodeJS.Timeout;

    // 즉시 차단 시스템 - 레벨 7~8 범위를 벗어나면 바로 데이터 차단
    const zoomChangedListener = () => {
      const currentLevel = map.getLevel();
      
      // 레벨 7~8 범위를 벗어나면 즉시 강제 차단 (렌더링 전에 차단)
      if (currentLevel < 7 || currentLevel > 8) {
        if (isShowingRef.current) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null; // UI 요소 없음
}
