'use client';

import React from 'react';
import MyPageHeader from '../../molecules/MyPage/MyPageHeader';
import MyProfileInfo from '../../molecules/MyPage/MyProfileInfo';
import MyPageMenu from '../../molecules/MyPage/MyPageMenu';

interface MyPageProps {
  onClose?: () => void;
  onEditInfo?: () => void;
  onSavedAreas?: () => void;
  className?: string;
}

const MyPage: React.FC<MyPageProps> = ({
  onClose,
  onEditInfo,
  onSavedAreas,
  className = ''
}) => {
  return (
    <div className={`w-1/4 p-4 space-y-4 bg-white h-screen ${className}`}>
      <MyPageHeader onBackClick={onClose} />
      <MyProfileInfo />
      <MyPageMenu 
        onEditInfo={onEditInfo}
        onSavedAreas={onSavedAreas}
      />
    </div>
  );
};

export default MyPage;