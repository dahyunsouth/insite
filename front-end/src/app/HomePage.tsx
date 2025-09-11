'use client';

import React, { useEffect, useState } from 'react';
import KakaoMap, { useKakaoMapContext } from '@/components/map/KakaoMap';
import RightActionBar from '@/components/organisms/RightActionBar/RightActionBar';
import CtaPillButton from '@/components/molecules/Detail/CtaPillButton/CtaPillButton';
import AreaDetailModal from '@/components/organisms/Detail/AreaDetailModal/AreaDetailModal';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import MainNavbar from '@/components/templates/LeftNavbar/MainNavbar';
import MyPageMenu from '@/components/templates/MyPage/MyPage';
import NotificationBar from '@/components/atoms/Common/NotificationBar';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutNotification, setShowLogoutNotification] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);

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

  // 마이페이지 열기 핸들러
  const handleMyPageClick = () => {
    setShowMyPage(true);
  };

  // 마이페이지 닫기 핸들러
  const handleMyPageClose = () => {
    setShowMyPage(false);
  };


  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 1) 풀스크린 카카오맵 (배경 고정) */}
      <KakaoMap>
        {/* 좌측 네비게이션 바 */}
        <div className="fixed w-1/4 top-0 left-0 right-0 z-20">
          {showMyPage && (
            <MyPageMenu 
              onClose={handleMyPageClose}
            />
          )}
          {!showMyPage && (
            <MainNavbar 
              onMyPageClick={handleMyPageClick} 
              onLoginModalOpen={() => setIsAuthOpen(true)}
            />
          )}
        </div>

        

        {/* 2) 우측 버튼 바 (지도 타입 토글 포함) */}
        <MapTypeHandler 
          isLoggedIn={isLoggedIn} 
          onLogoutSuccess={handleLogoutSuccess}
          onLoginSuccess={handleLoginSuccess}
        />
      </KakaoMap>

      {/* Bottom-center CTA preview for verification */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <CtaPillButton
          label="강남역 상권 분석 자세히 보기"
          ariaLabel="강남역 상권 분석 자세히 보기"
          onPress={() => setIsDetailOpen(true)}
        />
      </div>

      {/* Area detail modal */}
      <AreaDetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="강남역 상권 현황"
      />

      {/* 인증 모달 (AuthModalWrapper) - 조건부 렌더 */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50"
        onClick={() => setIsAuthOpen(false)}
        >
          {/* 딤 영역 */}
          <div
            className="absolute inset-0 bg-black/40"
          />
          {/* 모달 본체 */}
          <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
            <div
              className="w-[360px]"
              onClick={(e) => e.stopPropagation()} // 딤 클릭 닫기와 구분
            >
              <AuthModalWrapper className="w-[360px]" />
            </div>
          </div>
        </div>
      )}

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
