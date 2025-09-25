'use client';

import { KakaoPolygon } from './MarketMode';

// 기본 모드 폴리곤 스타일 적용
export function applyDefaultModePolygonStyle(polygon: KakaoPolygon): void {
  polygon.setOptions({
    strokeColor: '#3288FF',
    fillColor: '#3288FF',
    fillOpacity: 0,
    strokeWeight: 1,
    strokeOpacity: 1
  });
}

// 기본 모드 라벨 스타일 생성
export function createDefaultModeLabelStyle(): {
  labelBackgroundColor: string;
  labelBorderColor: string;
  hoverBackgroundColor: string;
  textColor: string;
  textShadow: string;
} {
  return {
    labelBackgroundColor: '#3288FF',
    labelBorderColor: '#3288FF',
    hoverBackgroundColor: '#FFFFFF',
    textColor: '#FFFFFF',
    textShadow: 'none'
  };
}

// 기본 모드 라벨 콘텐츠 생성
export function createDefaultModeLabelContent(
  guName: string,
  labelId: string,
  fontSize: number = 14
): string {
  const styles = createDefaultModeLabelStyle();
  
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
  " onmouseover="this.style.backgroundColor='${styles.hoverBackgroundColor}'; this.style.borderColor='${styles.labelBorderColor}'; this.style.color='#000000'; this.style.textShadow='none'; this.style.transform='scale(1.1)'" 
     onmouseout="this.style.backgroundColor='${styles.labelBackgroundColor}'; this.style.borderColor='${styles.labelBorderColor}'; this.style.color='${styles.textColor}'; this.style.textShadow='${styles.textShadow}'; this.style.transform='scale(1)'"
  >${guName}</div>`;
}

// 기본 모드 hover 처리
export function handleDefaultModeHover(
  polygon: KakaoPolygon,
  guName: string,
  isEnter: boolean
): void {
  if (isEnter) {
    // hover 시작: 파란색 hover 효과
    console.log(`🎯 ${guName} hover 시작: 일반모드`);
    polygon.setOptions({
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeOpacity: 1
    });
  } else {
    // hover 해제: 기본 파란색으로 복원
    console.log(`🔄 ${guName} hover 해제: 일반모드`);
    polygon.setOptions({
      strokeColor: '#3288FF',
      fillColor: '#3288FF',
      fillOpacity: 0,
      strokeWeight: 1,
      strokeOpacity: 1
    });
  }
}

// 기본 모드 폴리곤 배치 업데이트
export function updatePolygonsToDefaultMode(
  polygons: KakaoPolygon[],
  labels: any[]
): void {
  console.log('🔄 기본 모드 활성화 - 기본 상태로 복원');
  
  polygons.forEach((polygon) => {
    applyDefaultModePolygonStyle(polygon);
  });
  
  // 라벨도 기본 스타일로 복원 (내용도 함께 변경)
  labels.forEach((label, index) => {
    const currentLabelId = `signgu-label-${index}`;
    const labelElement = document.getElementById(currentLabelId);
    if (labelElement) {
      // 라벨 내용에서 구 이름만 추출 (상권 개수 제거)
      const guName = labelElement.textContent?.split('\n')[0] || labelElement.textContent || '알 수 없음';
      
      console.log(`🔄 자치구 라벨 기본 모드 복원: ${guName}`);
      
      // 라벨 전체를 기본 모드 콘텐츠로 교체
      labelElement.outerHTML = createDefaultModeLabelContent(guName, currentLabelId, 14);
    }
  });
}

// 행정동용 기본 모드 라벨 콘텐츠 생성
export function createDongDefaultModeLabelContent(
  dongName: string,
  labelId: string,
  fontSize: number = 10
): string {
  const defaultBackgroundColor = '#3288FF';
  const defaultBorderColor = '#3288FF';
  const defaultTextColor = '#ffffff';
  const hoverBackgroundColor = '#ffffff';
  const hoverBorderColor = '#3288FF';
  const hoverTextColor = '#000000';
  const textShadow = 'none';

  return `<div id="${labelId}" class="adstrd-label" style="
    padding: 4px 8px;
    font-size: ${fontSize}px;
    font-weight: bold;
    color: ${defaultTextColor};
    text-align: center;
    white-space: nowrap;
    pointer-events: auto;
    cursor: pointer;
    text-shadow: ${textShadow};
    background-color: ${defaultBackgroundColor};
    border-radius: 5px;
    border: 1px solid ${defaultBorderColor};
    transition: all 0.2s ease;
    z-index: 120;
  " onmouseover="this.style.backgroundColor='${hoverBackgroundColor}'; this.style.borderColor='${hoverBorderColor}'; this.style.color='${hoverTextColor}'; this.style.textShadow='none'; this.style.transform='scale(1.1)'" 
     onmouseout="this.style.backgroundColor='${defaultBackgroundColor}'; this.style.borderColor='${defaultBorderColor}'; this.style.color='${defaultTextColor}'; this.style.textShadow='${textShadow}'; this.style.transform='scale(1)'"
     onclick="this.style.backgroundColor='${hoverBackgroundColor}'; this.style.borderColor='${hoverBorderColor}'; this.style.color='${hoverTextColor}'; this.style.textShadow='none'; this.style.transform='scale(1.1)'"
  >${dongName}</div>`;
}

// 행정동용 기본 모드 hover 처리
export function handleDongDefaultModeHover(
  polygon: KakaoPolygon,
  dongName: string,
  isEnter: boolean
): void {
  if (isEnter) {
    // hover 시작: 파란색 hover 효과
    console.log(`🎯 ${dongName} hover 시작: 행정동 일반모드`);
    polygon.setOptions({
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeOpacity: 1
    });
  } else {
    // hover 해제: 기본 파란색으로 복원
    console.log(`🔄 ${dongName} hover 해제: 행정동 일반모드`);
    polygon.setOptions({
      strokeColor: '#3288FF',
      fillColor: '#3288FF',
      fillOpacity: 0,
      strokeWeight: 1,
      strokeOpacity: 0.8
    });
  }
}

// 행정동용 기본 모드 폴리곤 배치 업데이트
export function updateDongPolygonsToDefaultMode(
  polygons: KakaoPolygon[],
  labels: any[]
): void {
  console.log('🔄 행정동 기본 모드 활성화 - 기본 상태로 복원');
  
  polygons.forEach((polygon) => {
    applyDefaultModePolygonStyle(polygon);
  });
  
  // 라벨도 기본 스타일로 복원 (내용도 함께 변경)
  labels.forEach((label, index) => {
    const currentLabelId = `adstrd-label-${index}`;
    const labelElement = document.getElementById(currentLabelId);
    if (labelElement) {
      // 라벨 내용에서 행정동 이름만 추출 (상권 개수 제거)
      const dongName = labelElement.textContent?.split('\n')[0] || labelElement.textContent || '알 수 없음';
      
      console.log(`🔄 행정동 라벨 기본 모드 복원: ${dongName}`);
      
      // 라벨 전체를 기본 모드 콘텐츠로 교체
      labelElement.outerHTML = createDongDefaultModeLabelContent(dongName, currentLabelId, 10);
    }
  });
}
