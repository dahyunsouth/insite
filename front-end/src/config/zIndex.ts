/**
 * Z-Index 계층 시스템
 * 
 * 이 파일은 프로젝트 전체에서 사용되는 z-index 값을 체계적으로 관리합니다.
 * 새로운 요소를 추가할 때는 이 시스템을 따라 적절한 계층을 선택하세요.
 */

export const Z_INDEX = {
  // 기본 계층 (0-99)
  DEFAULT: 0,
  
  // 지도 관련 계층 (100-199)
  MAP_BASE: 100,
  MAP_OVERLAY: 110,
  MAP_MARKER: 120,
  MAP_POLYGON: 130,
  MAP_CUSTOM_OVERLAY: 140,
  
  // UI 컴포넌트 계층 (200-299)
  UI_BASE: 200,
  UI_BUTTON: 210,
  UI_CARD: 220,
  UI_PANEL: 230,
  
  // 네비게이션 계층 (300-399)
  NAV_BASE: 300,
  NAV_DROPDOWN: 310,
  NAV_MODAL: 320,
  
  // 알림/토스트 계층 (400-499)
  NOTIFICATION: 400,
  TOAST: 410,
  
  // 모달 계층 (500-599)
  MODAL_BACKDROP: 500,
  MODAL_CONTENT: 510,
  
  // 툴팁/팝오버 계층 (600-699)
  TOOLTIP: 600,
  POPOVER: 610,
  
  // 최상위 계층 (700-799)
  OVERLAY: 700,
  MAXIMUM: 2147483647, // JavaScript 최대 정수값 (특별한 경우에만 사용)
} as const;

/**
 * Z-Index 사용 가이드라인:
 * 
 * 1. 기본 UI 요소: UI_BASE (200)
 * 2. 지도 관련: MAP_* 계층 사용
 * 3. 네비게이션: NAV_* 계층 사용
 * 4. 모달: MODAL_* 계층 사용
 * 5. 툴팁: TOOLTIP 계층 사용
 * 6. 최상위 오버레이: OVERLAY 계층 사용
 * 
 * 새로운 요소를 추가할 때는 기존 계층 내에서 적절한 값을 선택하거나,
 * 새로운 계층이 필요한 경우 이 파일을 업데이트하세요.
 */
