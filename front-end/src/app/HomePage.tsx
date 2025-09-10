'use client';

import React, { useEffect, useState } from 'react';
import KakaoMap, { useKakaoMapContext } from '@/components/map/KakaoMap';
import RightActionBar from '@/components/organisms/RightActionBar/RightActionBar';
import MainNavbar from '@/components/templates/LeftNavbar/MainNavbar';
import NotificationBar from '@/components/atoms/Common/NotificationBar';

// 지도 타입 변경 핸들러 컴포넌트
function MapTypeHandler({ 
  isLoggedIn, 
  onLogoutSuccess,
  onLoginSuccess
}: { 
  isLoggedIn: boolean;
  onLogoutSuccess: () => void;
  onLoginSuccess: () => void;
}) {
  const mapContext = useKakaoMapContext();
  
  const handleMapTypeChange = (mapType: 'roadmap' | 'skyview') => {
    mapContext?.setMapType(mapType);
  };

  return (
    <RightActionBar 
      onMapTypeChange={handleMapTypeChange} 
      isLoggedIn={isLoggedIn}
      onLogoutSuccess={onLogoutSuccess}
      onLoginSuccess={onLoginSuccess}
    />
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutNotification, setShowLogoutNotification] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        setIsLoggedIn(true);
        console.log('저장된 토큰으로 로그인 상태 확인됨');
      } else {
        setIsLoggedIn(false);
        console.log('토큰이 없어 로그아웃 상태로 설정됨');
      }
    };
    
    checkLoginStatus();
  }, []);

  // 로그인 성공 핸들러
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginNotification(true); // 로그인 성공 안내바 표시
  };

  // 로그아웃 성공 핸들러
  const handleLogoutSuccess = () => {
    setIsLoggedIn(false);
    setShowLogoutNotification(true); // 안내바 표시
    console.log('로그아웃 성공 - 상태 업데이트됨');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 1) 풀스크린 카카오맵 (배경 고정) */}
      <KakaoMap>
        {/* 상단 네비게이션 바 */}
        <div className="fixed top-0 left-0 right-0 z-20">
          <MainNavbar />
        </div>


        {/* 2) 우측 버튼 바 (지도 타입 토글 포함) */}
        <MapTypeHandler 
          isLoggedIn={isLoggedIn} 
          onLogoutSuccess={handleLogoutSuccess}
          onLoginSuccess={handleLoginSuccess}
        />
      </KakaoMap>


      {/* 로그인 성공 안내바 */}
      <NotificationBar
        message="로그인되었습니다"
        isVisible={showLoginNotification}
        onClose={() => setShowLoginNotification(false)}
        duration={3000}
      />

      {/* 로그아웃 성공 안내바 */}
      <NotificationBar
        message="정상적으로 로그아웃 되었습니다"
        isVisible={showLogoutNotification}
        onClose={() => setShowLogoutNotification(false)}
        duration={3000}
      />
    </div>
  );
}