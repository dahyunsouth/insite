'use client';

import React from 'react';
import ProfilePics from '../../atoms/Common/ProfilePics';
import { useUser } from '../../../contexts/UserContext';

const MyProfileInfo: React.FC = () => {
  const { userInfo, loading, error } = useUser();

  // 프로필 이미지 경로 생성 함수
  const getProfileImageSrc = (profile: string | null | undefined) => {
    if (!profile || profile === 'default') {
      return '/profilepics/profile_default.png';
    }
    
    const validProfiles = ['cat', 'dog', 'fox', 'chick', 'panda', 'rabbit'];
    if (validProfiles.includes(profile)) {
      return `/profilepics/profile_${profile}.png`;
    }
    
    return '/profilepics/profile_default.png';
  };

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
        src={getProfileImageSrc(userInfo?.profile)}
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