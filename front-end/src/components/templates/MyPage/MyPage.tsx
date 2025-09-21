'use client';

import React, { useState } from 'react';
import MyPageHeader from '../../molecules/MyPage/MyPageHeader';
import MyProfileInfo from '../../molecules/MyPage/MyProfileInfo';
import MyPageMenu from '../../molecules/MyPage/MyPageMenu';
import MyMarket from './MyMarket';
import MyInfoUpdate from './MyInfoUpdate';
import PasswordUpdate from './PasswordUpdate';
import NotificationBar from '../../atoms/Common/NotificationBar';
import { UserProvider } from '../../../contexts/UserContext';

interface MyPageProps {
  onClose?: () => void;
  onEditInfo?: () => void;
  onSavedAreas?: () => void;
  onSavedAreasClose?: () => void;
  onCompareClick?: (selectedTradeAreas: { trdarCd: string; trdarCdNm: string }[]) => void;
  className?: string;
}

const MyPage: React.FC<MyPageProps> = ({
  onClose,
  onEditInfo,
  onSavedAreas,
  onSavedAreasClose,
  onCompareClick,
  className = ''
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'saved-areas' | 'edit-info' | 'password-update'>('main');
  
  // 알림 상태
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
  }>({ isVisible: false, message: '' });

  const handleSavedAreasClick = () => {
    setCurrentView('saved-areas');
    // 부모(HomePage)에게 알림: 저장된 상권 진입
    onSavedAreas?.();
  };

  const handleEditInfoClick = () => {
    setCurrentView('edit-info');
  };

  const handlePasswordUpdateClick = () => {
    setCurrentView('password-update');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    onSavedAreasClose?.();
  };

  if (currentView === 'saved-areas') {
    return (
      <UserProvider>
        <MyMarket 
          onBack={handleBackToMain}
          onCompareClick={onCompareClick}
          className={className}
        />
      </UserProvider>
    );
  }

  if (currentView === 'edit-info') {
    return (
      <UserProvider>
        <MyInfoUpdate 
          onBack={handleBackToMain}
          onInfoUpdateSuccess={(message) => {
            setNotification({ isVisible: true, message });
          }}
          className={className}
        />
      </UserProvider>
    );
  }

  if (currentView === 'password-update') {
    return (
      <UserProvider>
        <PasswordUpdate 
          onBack={handleBackToMain}
          onPasswordUpdateSuccess={(message) => {
            setNotification({ isVisible: true, message });
          }}
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
            onEditInfo={handleEditInfoClick}
            onSavedAreas={handleSavedAreasClick}
            onPasswordUpdate={handlePasswordUpdateClick}
          />
        </div>
      </div>
      
      {/* 알림 바 */}
      <NotificationBar
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ isVisible: false, message: '' })}
      />
    </UserProvider>
  );
};

export default MyPage;
