// JWT 토큰 관련 유틸리티 함수들

interface JwtPayload {
  sub: string; // 사용자 ID
  email: string;
  nickname: string;
  profile: string;
  provider: string;
  type: string;
  iat: number; // 발급 시간
  exp: number; // 만료 시간
}

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환합니다.
 * @param token JWT 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    // JWT 토큰은 header.payload.signature 형태
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64 URL 디코딩
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch (error) {
    console.error('JWT 토큰 디코딩 실패:', error);
    return null;
  }
}

/**
 * JWT 토큰이 유효한지 확인합니다.
 * @param token JWT 토큰
 * @returns 토큰이 유효하면 true, 아니면 false
 */
export function isTokenValid(token: string): boolean {
  const payload = decodeJwtToken(token);
  if (!payload) {
    return false;
  }

  // 만료 시간 확인 (현재 시간과 비교)
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
}

/**
 * JWT 토큰에서 사용자 정보를 추출합니다.
 * @param token JWT 토큰
 * @returns 사용자 정보 또는 null
 */
export function extractUserInfoFromToken(token: string): {
  uuid: string;
  email: string;
  nickname: string;
  profile: string;
  provider: string;
  type: string;
} | null {
  const payload = decodeJwtToken(token);
  if (!payload) {
    return null;
  }

  return {
    uuid: payload.sub,
    email: payload.email,
    nickname: payload.nickname,
    profile: payload.profile,
    provider: payload.provider,
    type: payload.type,
  };
}
