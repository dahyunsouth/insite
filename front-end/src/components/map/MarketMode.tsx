'use client';

import { useCallback, useState } from 'react';
import { getColorByCount } from '../../utils/marketingAreaColors';
import { API_ENDPOINTS } from '../../config/api';
import signGuData from '../../data/SignGuValue.json';

// 타입 정의
export interface KakaoPolygon {
  setMap: (map: any) => void;
  setOptions: (options: any) => void;
  getOptions?: () => any;
}

export interface GuCountData {
  [guName: string]: number;
}

export interface DongCountData {
  [dongKey: string]: number; // "자치구명-행정동명" 형태의 키
}

export interface MarketModeConfig {
  guCountData: GuCountData;
  isLoadingData: boolean;
  loadGuCountData: () => Promise<void>;
}

export interface DongMarketModeConfig {
  dongCountData: DongCountData;
  isLoadingDongData: boolean;
  loadDongCountData: (guName: string, dongName: string) => Promise<number>;
}

// 상권 모드 훅
export function useMarketMode(): MarketModeConfig {
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
          const url = `${API_ENDPOINTS.COUNT_BY_GU}?district=${encodeURIComponent(district.signgu_nm)}`;
          console.log(`🌐 API 호출: ${url}`);
          
          const response = await fetch(url);
          console.log(`📡 응답 상태: ${district.signgu_nm} - ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`📊 응답 데이터: ${district.signgu_nm}`, data);
            return { guName: district.signgu_nm, count: data.result?.count || 0 };
          } else {
            console.warn(`❌ API 실패: ${district.signgu_nm} - ${response.status} ${response.statusText}`);
            return { guName: district.signgu_nm, count: 0 };
          }
        } catch (error) {
          console.error(`💥 API 에러: ${district.signgu_nm}`, error);
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

  return {
    guCountData,
    isLoadingData,
    loadGuCountData
  };
}

// 행정동별 상권 모드 훅
export function useDongMarketMode(): DongMarketModeConfig {
  const [dongCountData, setDongCountData] = useState<DongCountData>({});
  const [isLoadingDongData, setIsLoadingDongData] = useState<boolean>(false);

  // 행정동명 정규화 (API에서 인식할 수 있는 형태로 변환)
  const normalizeDongName = useCallback((dongName: string): string => {
    let normalized = dongName.trim();
    
    // 일반적인 변환 시도들
    // 1. 숫자를 한글로 변환 (예: "일원2동" -> "일원이동")
    const numberToKorean: {[key: string]: string} = {
      '1': '일', '2': '이', '3': '삼', '4': '사', '5': '오',
      '6': '육', '7': '칠', '8': '팔', '9': '구', '0': '영'
    };
    
    // 숫자가 포함된 경우 한글로 변환 시도
    if (/\d/.test(dongName)) {
      let koreanVersion = dongName;
      for (const [num, korean] of Object.entries(numberToKorean)) {
        koreanVersion = koreanVersion.replace(new RegExp(num, 'g'), korean);
      }
      
      console.log(`🔄 행정동명 정규화 (숫자->한글): "${dongName}" -> "${koreanVersion}"`);
      
      // 일단 원본을 사용하되, 필요시 한글 버전도 시도할 수 있도록 준비
      normalized = dongName; // 먼저 원본으로 시도
    }
    
    // 특수 케이스 처리
    const specialCases: {[key: string]: string} = {
      // API가 다른 형태를 기대한다면 여기에 추가
      // "상일동": "상일1동", // 예시
    };
    
    if (specialCases[dongName]) {
      normalized = specialCases[dongName];
      console.log(`🔄 행정동명 정규화 (특수케이스): "${dongName}" -> "${normalized}"`);
    }

    // 면목 3·8동 표기 변환: 제, 점/가운뎃점/물음표 등 다양한 표기를 DB 표기 '면목3?8동'으로 통일
    const noSpace = normalized.replace(/\s+/g, '');
    if (/^면목(제)?3[\.·ㆍ\?]8동$/.test(noSpace)) {
      normalized = '면목3?8동';
      console.log(`🔄 행정동명 정규화 (면목3·8동): "${dongName}" -> "${normalized}"`);
    }
    
    return normalized;
  }, []);

  // 개별 행정동 상권 개수 데이터 로드
  const loadDongCountData = useCallback(async (guName: string, dongName: string): Promise<number> => {
    const dongKey = `${guName}-${dongName}`;
    
    // 이미 로드된 데이터가 있으면 반환
    if (dongCountData[dongKey] !== undefined) {
      return dongCountData[dongKey];
    }
    
    // 행정동명 정규화
    const normalizedDongName = normalizeDongName(dongName);
    
    setIsLoadingDongData(true);
    try {
      const url = `${API_ENDPOINTS.COUNT_BY_DONG}?district=${encodeURIComponent(guName)}&dong=${encodeURIComponent(normalizedDongName)}`;
      console.log(`🌐 행정동 API 호출: ${url}`);
      console.log(`📝 전달 파라미터: district="${guName}", dong="${normalizedDongName}" (원본: "${dongName}")`);
      console.log(`🔗 인코딩된 파라미터: district="${encodeURIComponent(guName)}", dong="${encodeURIComponent(normalizedDongName)}"`);
      
      const response = await fetch(url);
      console.log(`📡 행정동 응답 상태: ${guName} ${normalizedDongName} - ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 행정동 응답 데이터: ${guName} ${dongName}`, data);
        const count = data.result?.count || 0;
        
        // 캐시에 저장
        setDongCountData(prev => ({
          ...prev,
          [dongKey]: count
        }));
        
        console.log(`✅ 행정동 상권 개수 로드 완료: ${guName} ${dongName} = ${count}개`);
        return count;
      } else {
        // 에러 응답도 JSON으로 파싱해서 확인
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ 행정동 API 실패: ${guName} ${dongName} - ${response.status} ${response.statusText}`);
        console.error(`💥 에러 응답 데이터:`, errorData);
        
        // 400 에러인 경우 파라미터 문제일 가능성이 높음
        if (response.status === 400) {
          console.error(`🔍 400 에러 분석:`);
          console.error(`  - 자치구명: "${guName}" (길이: ${guName.length})`);
          console.error(`  - 행정동명: "${normalizedDongName}" (길이: ${normalizedDongName.length})`);
          console.error(`  - 원본 행정동명: "${dongName}"`);
          console.error(`  - URL: ${url}`);
          
          // 숫자가 포함된 경우 한글로 변환해서 재시도
          if (/\d/.test(dongName) && normalizedDongName === dongName) {
            console.log(`🔄 400 에러 재시도: 숫자를 한글로 변환`);
            const numberToKorean: {[key: string]: string} = {
              '1': '일', '2': '이', '3': '삼', '4': '사', '5': '오',
              '6': '육', '7': '칠', '8': '팔', '9': '구', '0': '영'
            };
            
            let koreanVersion = dongName;
            for (const [num, korean] of Object.entries(numberToKorean)) {
              koreanVersion = koreanVersion.replace(new RegExp(num, 'g'), korean);
            }
            
            if (koreanVersion !== dongName) {
              console.log(`🔄 한글 버전으로 재시도: "${dongName}" -> "${koreanVersion}"`);
              // 재귀 호출로 한글 버전 시도
              return await loadDongCountData(guName, koreanVersion);
            }
          }
        }
        
        return 0;
      }
    } catch (error) {
      console.error(`💥 행정동 API 에러: ${guName} ${dongName}`, error);
      return 0;
    } finally {
      setIsLoadingDongData(false);
    }
  }, [dongCountData, normalizeDongName]);

  return {
    dongCountData,
    isLoadingDongData,
    loadDongCountData
  };
}

// 상권 모드 폴리곤 스타일 적용
export function applyMarketModePolygonStyle(
  polygon: KakaoPolygon,
  guName: string,
  guCountData: GuCountData
): void {
  const count = guCountData[guName] || 0;
  const baseColor = getColorByCount(count);
  const fillOpacity = count > 0 ? 0.1 : 0; // 상권이 1개 이상 있으면 배경 표시
  
  console.log(`🎨 상권모드 폴리곤: ${guName}, count=${count}, color=${baseColor}, opacity=${fillOpacity}`);
  
  polygon.setOptions({
    strokeColor: baseColor,
    fillColor: baseColor,
    fillOpacity: fillOpacity,
    strokeWeight: 1,
    strokeOpacity: 1
  });
}

// 상권 모드 라벨 스타일 생성
export function createMarketModeLabelStyle(
  _guName: string,
  _guCountData: GuCountData
): {
  labelBackgroundColor: string;
  labelBorderColor: string;
  hoverBackgroundColor: string;
  textColor: string;
  textShadow: string;
} {
  // 고정 색상 정책: 기본 파란 배경, 호버 흰 배경
  return {
    labelBackgroundColor: '#3288FF',
    labelBorderColor: '#3288FF',
    hoverBackgroundColor: '#FFFFFF',
    textColor: '#ffffff',
    textShadow: 'none'
  };
}

// 상권 모드 라벨 콘텐츠 생성 (개수 포함)
export function createMarketModeLabelContent(
  guName: string,
  guCountData: GuCountData,
  labelId: string,
  fontSize: number = 14,
  showCount: boolean = false
): string {
  const count = guCountData[guName] || 0;
  const styles = createMarketModeLabelStyle(guName, guCountData);
  
  const mainText = guName;
  const countText = showCount ? `<div style="font-size: ${fontSize - 2}px; margin-top: 2px; opacity: 0.9;">${count}개</div>` : '';
  
  return `<div id="${labelId}" class="signgu-label" style="
    padding: 6px 12px;
    font-size: ${fontSize}px;
    font-weight: bold;
    color: ${styles.textColor};
    text-align: center;
    white-space: nowrap;
    pointer-events: auto;
    cursor: pointer;
    text-shadow: ${styles.textShadow};
    background-color: ${styles.labelBackgroundColor};
    border-radius: 8px;
    border: 2px solid ${styles.labelBorderColor};
    transition: all 0.2s ease;
    line-height: 1.2;
  " onmouseover="this.style.backgroundColor='${styles.hoverBackgroundColor}'; this.style.borderColor='${styles.labelBorderColor}'; this.style.color='#000000'; this.style.textShadow='none'; this.style.transform='scale(1.1)'" 
     onmouseout="this.style.backgroundColor='${styles.labelBackgroundColor}'; this.style.borderColor='${styles.labelBorderColor}'; this.style.color='${styles.textColor}'; this.style.textShadow='${styles.textShadow}'; this.style.transform='scale(1)'"
     onclick="this.style.backgroundColor='${styles.hoverBackgroundColor}'; this.style.borderColor='${styles.labelBorderColor}'; this.style.color='#000000'; this.style.textShadow='none'; this.style.transform='scale(1.1)'"
  >${mainText}${countText}</div>`;
}

// 상권 모드 hover 처리
export function handleMarketModeHover(
  polygon: KakaoPolygon,
  guName: string,
  guCountData: GuCountData,
  isEnter: boolean
): void {
  if (isEnter) {
    // hover 시작: 배경 불투명도만 20%로 증가, 색상은 유지
    console.log(`🎯 ${guName} hover 시작: 상권모드`);
    polygon.setOptions({
      fillOpacity: 0.2,
      strokeWeight: 2,
      strokeOpacity: 1
    });
  } else {
    // hover 해제: 각 구의 원래 상권 색상으로 복원
    const count = guCountData[guName] || 0;
    const baseColor = getColorByCount(count);
    const fillOpacity = count > 0 ? 0.1 : 0; // 상권이 1개 이상 있으면 배경 표시
    
    console.log(`🔄 ${guName} hover 해제: 상권모드, count=${count}, color=${baseColor}, opacity=${fillOpacity}`);
    
    polygon.setOptions({
      strokeColor: baseColor,
      fillColor: baseColor,
      fillOpacity: fillOpacity,
      strokeWeight: 1,
      strokeOpacity: 1
    });
  }
}

// 상권 모드 폴리곤 배치 업데이트
export function updatePolygonsToMarketMode(
  polygons: KakaoPolygon[],
  labels: any[],
  guCountData: GuCountData
): void {
  console.log('🎯 상권 모드 활성화 - 폴리곤 색상 업데이트');
  
  polygons.forEach((polygon, index) => {
    const district = signGuData.DATA[index];
    if (district) {
      const guName = district.signgu_nm;
      applyMarketModePolygonStyle(polygon, guName, guCountData);
      console.log(`  ${guName}: ${guCountData[guName] || 0}개 -> ${getColorByCount(guCountData[guName] || 0)}`);
    }
  });
  
  // 라벨도 상권 모드 스타일로 업데이트
  labels.forEach((label, index) => {
    const district = signGuData.DATA[index];
    if (district) {
      const guName = district.signgu_nm;
      const styles = createMarketModeLabelStyle(guName, guCountData);
      
      const currentLabelId = `signgu-label-${index}`;
      const labelElement = document.getElementById(currentLabelId);
      if (labelElement) {
        labelElement.style.backgroundColor = styles.labelBackgroundColor;
        labelElement.style.borderColor = styles.labelBorderColor;
        labelElement.style.color = styles.textColor;
        labelElement.style.textShadow = styles.textShadow;
        
        // hover 이벤트 업데이트
        labelElement.setAttribute('onmouseover', 
          `this.style.backgroundColor='${styles.hoverBackgroundColor}'; this.style.borderColor='${styles.hoverBackgroundColor}'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1.1)'`
        );
        labelElement.setAttribute('onmouseout', 
          `this.style.backgroundColor='${styles.labelBackgroundColor}'; this.style.borderColor='${styles.labelBorderColor}'; this.style.color='#ffffff'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1)'`
        );
      }
    }
  });
}

// 행정동용 상권 모드 폴리곤 스타일 적용
export function applyDongMarketModePolygonStyle(
  polygon: KakaoPolygon,
  count: number
): void {
  const baseColor = getColorByCount(count);
  const fillOpacity = count > 0 ? 0.1 : 0; // 상권이 1개 이상 있으면 배경 표시
  
  console.log(`🎨 행정동 상권모드 폴리곤: count=${count}, color=${baseColor}, opacity=${fillOpacity}`);
  
  polygon.setOptions({
    strokeColor: baseColor,
    fillColor: baseColor,
    fillOpacity: fillOpacity,
    strokeWeight: 1,
    strokeOpacity: 1
  });
}

// 행정동용 상권 모드 라벨 콘텐츠 생성
export function createDongMarketModeLabelContent(
  dongName: string,
  count: number,
  labelId: string,
  fontSize: number = 10,
  showCount: boolean = false
): string {
  // 행정동 라벨은 고정 색상 정책 적용
  const defaultBackgroundColor = '#3288FF';
  const defaultBorderColor = '#3288FF';
  const defaultTextColor = '#ffffff';
  const hoverBackgroundColor = '#ffffff';
  const hoverBorderColor = '#3288FF';
  const hoverTextColor = '#000000';
  
  const mainText = dongName;
  const countText = showCount ? `<div style="font-size: ${fontSize - 1}px; margin-top: 1px; opacity: 0.9;">${count}개</div>` : '';
  
  return `<div id="${labelId}" class="adstrd-label" style="
    padding: 4px 8px;
    font-size: ${fontSize}px;
    font-weight: bold;
    color: ${defaultTextColor};
    text-align: center;
    white-space: nowrap;
    pointer-events: auto;
    cursor: pointer;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    background-color: ${defaultBackgroundColor};
    border-radius: 5px;
    border: 1px solid ${defaultBorderColor};
    transition: all 0.2s ease;
    line-height: 1.2;
    z-index: 120;
  " onmouseover="this.style.backgroundColor='${hoverBackgroundColor}'; this.style.borderColor='${hoverBorderColor}'; this.style.color='${hoverTextColor}'; this.style.textShadow='none'; this.style.transform='scale(1.1)'" 
     onmouseout="this.style.backgroundColor='${defaultBackgroundColor}'; this.style.borderColor='${defaultBorderColor}'; this.style.color='${defaultTextColor}'; this.style.textShadow='1px 1px 2px rgba(0,0,0,0.7)'; this.style.transform='scale(1)'"
     onclick="this.style.backgroundColor='${hoverBackgroundColor}'; this.style.borderColor='${hoverBorderColor}'; this.style.color='${hoverTextColor}'; this.style.textShadow='none'; this.style.transform='scale(1.1)'"
  >${mainText}${countText}</div>`;
}

// 행정동용 상권 모드 hover 처리
export function handleDongMarketModeHover(
  polygon: KakaoPolygon,
  dongName: string,
  count: number,
  isEnter: boolean
): void {
  if (isEnter) {
    // hover 시작: 배경 불투명도만 30%로 증가, 색상은 유지
    console.log(`🎯 ${dongName} hover 시작: 행정동 상권모드`);
    polygon.setOptions({
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeOpacity: 1
    });
  } else {
    // hover 해제: 원래 상권 색상으로 복원
    const baseColor = getColorByCount(count);
    const fillOpacity = count > 0 ? 0.1 : 0; // 상권이 1개 이상 있으면 배경 표시
    
    console.log(`🔄 ${dongName} hover 해제: 행정동 상권모드, count=${count}, color=${baseColor}, opacity=${fillOpacity}`);
    
    polygon.setOptions({
      strokeColor: baseColor,
      fillColor: baseColor,
      fillOpacity: fillOpacity,
      strokeWeight: 1,
      strokeOpacity: 1
    });
  }
}
