'use client';

import React from 'react';
import ProfilePics from '../../atoms/Common/ProfilePics';
import { useUser } from '../../../contexts/UserContext';

const MyProfileInfo: React.FC = () => {
  const { userInfo, loading, error } = useUser();

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