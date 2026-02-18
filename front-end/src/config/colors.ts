/**
 * 색상 토큰 상수
 *
 * 이 값들은 globals.css @theme inline에 정의된 CSS 커스텀 프로퍼티와 동일합니다.
 * CSS 변수를 사용할 수 없는 곳(Kakao Maps API, DOM 조작, 템플릿 리터럴)에서만 사용하세요.
 *
 * Tailwind 클래스나 React 인라인 스타일에서는 CSS 토큰을 직접 사용하세요:
 *   - Tailwind: bg-brand-primary, text-brand-primary, border-line-default
 *   - 인라인:   style={{ color: 'var(--color-brand-primary)' }}
 */

export const COLORS = {
  BRAND_PRIMARY: '#3288FF',
  BRAND_SECONDARY: '#5AB8E2',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  DARK: '#404040',
  LINE_DEFAULT: '#D9D9D9',
  LINE_LIGHT: '#E9ECEF',
} as const;

/** 투명도 변형 (템플릿 리터럴용) */
export const COLORS_ALPHA = {
  BRAND_PRIMARY_80: 'rgba(50, 136, 255, 0.8)',
  BRAND_PRIMARY_10: 'rgba(50, 136, 255, 0.1)',
} as const;

/** 데이터 시각화 팔레트 — globals.css의 viz-1 ~ viz-6에 대응 */
export const VIZ_COLORS = [
  '#9DDE4D',  // viz-1
  '#FFD62B',  // viz-2
  '#FF8A36',  // viz-3
  '#FF3F43',  // viz-4
  '#5473DF',  // viz-5
  '#8C2ED4',  // viz-6
] as const;
