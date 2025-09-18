// 상권 개수별 색상 매핑 유틸리티
export interface ColorRange {
  color: string;
  label: string;
  min: number;
  max: number;
}

// MarketingAreaRange.tsx와 동일한 색상 범위 정의
export const COLOR_RANGES: ColorRange[] = [
  { color: "#000000", label: "5개 미만", min: 0, max: 4 },
  { color: "#9DDE4D", label: "5 ~ 10개", min: 5, max: 10 },
  { color: "#FFD62B", label: "11 ~ 50개", min: 11, max: 50 },
  { color: "#FF8A36", label: "51 ~ 300개", min: 51, max: 300 },
  { color: "#FF3F43", label: "301 ~ 1,000개", min: 301, max: 1000 },
  { color: "#5473DF", label: "1,001 ~ 2,000개", min: 1001, max: 2000 },
  { color: "#8C2ED4", label: "2,000개 초과", min: 2001, max: Infinity },
];

// 기본 색상 (상권 개수가 5개 미만인 경우)
export const DEFAULT_COLOR = "#000000"; // 검정색으로 변경

/**
 * 상권 개수에 따른 색상 반환
 * @param count 상권 개수
 * @returns 해당 범위의 색상
 */
export function getColorByCount(count: number): string {
  const range = COLOR_RANGES.find(range => count >= range.min && count <= range.max);
  return range ? range.color : DEFAULT_COLOR;
}

/**
 * 색상에 불투명도 적용
 * @param color 16진수 색상 코드
 * @param opacity 불투명도 (0-1)
 * @returns rgba 형태의 색상
 */
export function addOpacityToColor(color: string, opacity: number): string {
  // #RRGGBB 형태의 색상을 rgba로 변환
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * 색상을 더 진하게 만들기 (hover 효과용)
 * @param color 16진수 색상 코드
 * @param darkenAmount 진하게 할 정도 (0-1, 기본값: 0.2)
 * @returns 더 진한 16진수 색상
 */
export function darkenColor(color: string, darkenAmount: number = 0.2): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const darkenedR = Math.max(0, Math.floor(r * (1 - darkenAmount)));
  const darkenedG = Math.max(0, Math.floor(g * (1 - darkenAmount)));
  const darkenedB = Math.max(0, Math.floor(b * (1 - darkenAmount)));
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  
  return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`;
}
