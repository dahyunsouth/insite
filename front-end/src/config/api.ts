// API 설정
// 배포된 서버 주소 사용 (환경 변수로 오버라이드 가능)
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://43.203.196.29:8080';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

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
} as const;
