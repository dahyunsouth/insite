// API 설정
// 1) NEXT_PUBLIC_API_BASE_URL이 설정되어 있으면 우선 사용
// 2) 브라우저 환경이면 현재 페이지의 origin을 기본값으로 사용해 혼합 콘텐츠를 방지
// 3) 서버/로컬 빌드 시 fallback은 개발용 로컬 서버
const getDefaultBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://j13e203.p.ssafy.io';
  }
  return 'http://localhost:8080';
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? getDefaultBaseUrl();

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  SIGNUP: `${API_BASE_URL}/api/v1/auth/signup`,
  REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  USER_INFO: `${API_BASE_URL}/api/v1/auth/user`,
  USER_UPDATE: `${API_BASE_URL}/api/v1/auth/user`,
  USER_DELETE: `${API_BASE_URL}/api/v1/auth/user`,
  EMAIL_CHECK: `${API_BASE_URL}/api/v1/auth/check/email`,
  NICKNAME_CHECK: `${API_BASE_URL}/api/v1/auth/check/nickname`,
  SEND_VERIFICATION_CODE: `${API_BASE_URL}/api/v1/auth/verify/send-code`,
  CHECK_VERIFICATION_CODE: `${API_BASE_URL}/api/v1/auth/verify/check-code`,
  COUNT_BY_GU: `${API_BASE_URL}/api/v1/data/count-by-gu`,
  COUNT_BY_DONG: `${API_BASE_URL}/api/v1/data/count-by-dong`,
  TRADE_AREAS: `${API_BASE_URL}/api/v1/data/trade-areas`,
  TRADE_AREA_DETAIL: `${API_BASE_URL}/api/v1/data/trade-area-detail`,
  REC_SYS: `${API_BASE_URL}/api/v1/data/rec-sys`,
  AI_SUMMARY: `${API_BASE_URL}/api/v1/ai/summary`,
} as const;
