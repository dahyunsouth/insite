'use client';

import React, { useState, useEffect } from 'react';
import ProfilePics from '../../atoms/Common/ProfilePics';
import { API_ENDPOINTS } from '../../../config/api';

interface UserInfo {
  uuid: string;
  email: string;
  nickname: string;
  profile: string;
  provider: string;
  type: string;
}

interface ApiResponse {
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
  result: UserInfo;
}

const MyProfileInfo: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const response = await fetch(API_ENDPOINTS.USER_INFO, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }

        const data: ApiResponse = await response.json();
        
        if (data.isSuccess && data.result) {
          setUserInfo(data.result);
        } else {
          setError(data.message || '사용자 정보를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-row items-center p-4 bg-gray-100 rounded-lg">
        <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="flex flex-col items-start ml-2">
          <div className="w-20 h-5 bg-gray-300 rounded animate-pulse mb-1"></div>
          <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-row items-center p-4 bg-red-50 rounded-lg">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center p-4 rounded-lg">
      <ProfilePics 
        alt={`${userInfo?.nickname || '사용자'} 프로필`}
        size="lg"
      />
      <div className="flex flex-col items-start ml-2">
        <div className="text-lg font-bold text-black">
          {userInfo?.nickname || '사용자'}
        </div>
        <div className="text-sm text-gray-400">
          {userInfo?.email || '이메일 없음'}
        </div>
      </div>
    </div>
  );
};

export default MyProfileInfo;