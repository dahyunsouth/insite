'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authManager } from '../utils/auth';
import { extractUserInfoFromToken, isTokenValid } from '../utils/jwt';
import { API_ENDPOINTS } from '../config/api';

interface UserInfo {
  uuid: string;
  email: string;
  nickname: string;
  profile: string;
  provider: string;
  type: string;
}

interface UserContextType {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUserInfo: () => Promise<void>;
  clearUserInfo: () => void;
  deleteUser: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 사용자 정보 가져오기
  const getCachedUserInfo = (): UserInfo | null => {
    try {
      const cached = localStorage.getItem('userInfo');
      if (cached) {
        const userInfo = JSON.parse(cached);
        // 캐시된 정보가 유효한지 확인 (토큰이 있는지)
        if (authManager.isLoggedIn()) {
          return userInfo;
        } else {
          // 로그아웃된 경우 캐시 삭제
          localStorage.removeItem('userInfo');
        }
      }
    } catch (error) {
      console.error('캐시된 사용자 정보 파싱 실패:', error);
      localStorage.removeItem('userInfo');
    }
    return null;
  };

  // 사용자 정보를 localStorage에 저장
  const setCachedUserInfo = (userInfo: UserInfo): void => {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
      console.error('사용자 정보 캐시 저장 실패:', error);
    }
  };

  // JWT 토큰에서 사용자 정보 추출 시도 (백업용)
  const extractUserFromToken = (): UserInfo | null => {
    const token = authManager.getAccessToken();
    console.log('🔍 [UserContext] 저장된 토큰:', token);
    console.log('🔍 [UserContext] 토큰 유효성:', token ? isTokenValid(token) : false);
    
    if (!token || !isTokenValid(token)) {
      console.log('❌ [UserContext] 토큰이 없거나 유효하지 않음');
      return null;
    }

    const userInfo = extractUserInfoFromToken(token);
    console.log('🔍 [UserContext] 토큰에서 추출된 사용자 정보:', userInfo);
    return userInfo;
  };

  // API에서 사용자 정보 가져오기
  const fetchUserInfoFromAPI = async (): Promise<UserInfo | null> => {
    console.log('🌐 [UserContext] API 호출 시작 - fetchUserInfoFromAPI');
    console.log('🌐 [UserContext] API URL:', API_ENDPOINTS.USER_INFO);
    
    try {
      const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_INFO, {
        method: 'GET',
      });

      console.log('🌐 [UserContext] API 응답 상태:', response.status);
      console.log('🌐 [UserContext] API 응답 OK:', response.ok);

      if (!response.ok) {
        console.error('❌ [UserContext] API 응답 실패:', response.status);
        throw new Error(`사용자 정보를 가져오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log('🌐 [UserContext] API 응답 데이터:', data);
      console.log('🌐 [UserContext] result 객체 상세:', data.result);
      console.log('🌐 [UserContext] result 타입:', typeof data.result);
      console.log('🌐 [UserContext] result 키들:', data.result ? Object.keys(data.result) : 'null');
      
      if (data.isSuccess && data.result) {
        console.log('✅ [UserContext] API에서 사용자 정보 추출 성공:', data.result);
        console.log('✅ [UserContext] 반환할 사용자 정보:', JSON.stringify(data.result, null, 2));
        return data.result;
      } else {
        console.error('❌ [UserContext] API 응답 데이터 형식 오류:', data);
        throw new Error(data.message || '사용자 정보를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error('❌ [UserContext] API 호출 에러:', errorMessage);
      setError(errorMessage);
      
      // 인증 관련 에러인 경우 로그아웃 처리
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('Please login again')) {
        console.log('🔐 [UserContext] 인증 실패 - 토큰 삭제');
        authManager.clearTokens();
        setUserInfo(null);
      }
      
      return null;
    }
  };

  // 사용자 정보 새로고침
  const refreshUserInfo = async (): Promise<void> => {
    console.log('🔄 [UserContext] refreshUserInfo 시작');
    console.log('🔄 [UserContext] 로그인 상태:', authManager.isLoggedIn());
    
    if (!authManager.isLoggedIn()) {
      console.log('❌ [UserContext] 로그인되지 않음');
      setUserInfo(null);
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. 먼저 캐시된 사용자 정보 확인 (즉시 표시)
    const cachedUserInfo = getCachedUserInfo();
    console.log('🔄 [UserContext] 캐시된 사용자 정보:', cachedUserInfo);
    
    if (cachedUserInfo) {
      console.log('✅ [UserContext] 캐시된 정보 사용');
      setUserInfo(cachedUserInfo);
      setLoading(false);
      
      // 백그라운드에서 최신 정보 확인 (선택적)
      // API 호출은 하지만 UI는 블로킹하지 않음
      fetchUserInfoFromAPI().then(apiUserInfo => {
        if (apiUserInfo) {
          setUserInfo(apiUserInfo);
          setCachedUserInfo(apiUserInfo);
        }
      }).catch(error => {
        console.warn('백그라운드 사용자 정보 업데이트 실패:', error);
      });
      return;
    }

    // 2. JWT 토큰에서 사용자 정보 추출 시도 (백업)
    console.log('🔄 [UserContext] JWT 토큰에서 사용자 정보 추출 시도');
    const tokenUserInfo = extractUserFromToken();
    if (tokenUserInfo) {
      console.log('✅ [UserContext] 토큰에서 사용자 정보 추출 성공');
      setUserInfo(tokenUserInfo);
      setCachedUserInfo(tokenUserInfo);
      setLoading(false);
      return;
    }

    // 3. 마지막으로 API 호출
    console.log('🔄 [UserContext] API 호출로 사용자 정보 가져오기');
    const apiUserInfo = await fetchUserInfoFromAPI();
    if (apiUserInfo) {
      console.log('✅ [UserContext] API에서 사용자 정보 가져오기 성공');
      setUserInfo(apiUserInfo);
      setCachedUserInfo(apiUserInfo);
    } else {
      console.log('❌ [UserContext] API에서 사용자 정보 가져오기 실패');
    }
    
    setLoading(false);
  };

  // 사용자 정보 초기화
  const clearUserInfo = (): void => {
    setUserInfo(null);
    setError(null);
    setLoading(false);
    // 캐시된 사용자 정보도 삭제
    localStorage.removeItem('userInfo');
  };

  // 회원탈퇴
  const deleteUser = async (): Promise<boolean> => {
    try {
      const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_DELETE, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`회원탈퇴에 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        // 성공 시 모든 인증 정보 삭제
        authManager.clearTokens();
        clearUserInfo();
        return true;
      } else {
        throw new Error(data.message || '회원탈퇴에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('회원탈퇴 오류:', err);
      return false;
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    refreshUserInfo();
  }, []);

  const value: UserContextType = {
    userInfo,
    loading,
    error,
    refreshUserInfo,
    clearUserInfo,
    deleteUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
