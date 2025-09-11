import { API_ENDPOINTS } from '../config/api';

interface RefreshResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    accessToken: string;
  };
}

class AuthManager {
  private static instance: AuthManager;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // 토큰 저장
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Access Token 가져오기
  getAccessToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Refresh Token 가져오기
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // 토큰 제거
  clearTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    // 사용자 정보 캐시도 함께 제거
    localStorage.removeItem('userInfo');
  }

  // 토큰 재발급
  async refreshAccessToken(): Promise<string | null> {
    // 이미 재발급 중이면 기존 Promise 반환
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const response = await fetch(API_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data: RefreshResponse = await response.json();
      
      if (data.isSuccess && data.result?.accessToken) {
        const newAccessToken = data.result.accessToken;
        localStorage.setItem('authToken', newAccessToken);
        return newAccessToken;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  // 인증된 요청 보내기 (자동 토큰 재발급 포함)
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let accessToken = this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // 첫 번째 요청 시도
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 403 에러 시 토큰 재발급 시도
    if (response.status === 403) {
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        // 재발급 성공 시 새로운 토큰으로 재요청
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // 재발급 실패 시 로그아웃 처리
        this.clearTokens();
        throw new Error('Authentication failed. Please login again.');
      }
    }

    return response;
  }

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}

export const authManager = AuthManager.getInstance();
export default authManager;
