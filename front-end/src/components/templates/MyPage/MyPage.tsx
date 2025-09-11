'use client';

import React, { useState } from 'react';
import MyPageHeader from '../../molecules/MyPage/MyPageHeader';
import MyProfileInfo from '../../molecules/MyPage/MyProfileInfo';
import MyPageMenu from '../../molecules/MyPage/MyPageMenu';
import MyMarket from './MyMarket';
import { UserProvider } from '../../../contexts/UserContext';

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
  const [currentView, setCurrentView] = useState<'main' | 'saved-areas'>('main');

  const handleSavedAreasClick = () => {
    setCurrentView('saved-areas');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (currentView === 'saved-areas') {
    return (
      <UserProvider>
        <MyMarket 
          onBack={handleBackToMain}
          className={className}
        />
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <div className={`p-4 bg-white h-screen ${className}`}>
        <MyPageHeader onBackClick={onClose} />
        <MyProfileInfo />
        <div className="mt-4">
          <MyPageMenu 
            onEditInfo={onEditInfo}
            onSavedAreas={handleSavedAreasClick}
          />
        </div>
      </div>
    </UserProvider>
  );
};

export default MyPage;