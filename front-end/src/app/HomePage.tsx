'use client';

import React, { useEffect, useState } from 'react';
import KakaoMap, { useKakaoMapContext } from '@/components/map/KakaoMap';
import LoadView from '@/components/map/LoadView';
import RightActionBar from '@/components/organisms/RightActionBar/RightActionBar';
import CtaPillButton from '@/components/molecules/Detail/CtaPillButton/CtaPillButton';
import AreaDetailModal from '@/components/organisms/Detail/AreaDetailModal/AreaDetailModal';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import MainNavbar from '@/components/templates/LeftNavbar/MainNavbar';
import MyPageMenu from '@/components/templates/MyPage/MyPage';
import MyMarket from '@/components/templates/MyPage/MyMarket';
import NotificationBar from '@/components/atoms/Common/NotificationBar';
import CompareTradeAreasModal from '@/components/organisms/Compare/CompareTradeAreasModal';

// 지도 타입 변경 핸들러 컴포넌트
function MapTypeHandler({ 
  isLoggedIn, 
  onLogoutSuccess,
  onLoginSuccess,
  isLoadViewActive,
  isLoadViewMinimized,
  onLoadViewToggle,
  isCafeActive,
  onCafeToggle
}: { 
  isLoggedIn: boolean;
  onLogoutSuccess: () => void;
  onLoginSuccess: () => void;
  isLoadViewActive: boolean;
  isLoadViewMinimized: boolean;
  onLoadViewToggle: (action: boolean | 'minimize' | 'restore') => void;
  isCafeActive: boolean;
  onCafeToggle: (categoryId: string) => void;
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
      isLoadViewActive={isLoadViewActive}
      isLoadViewMinimized={isLoadViewMinimized}
      onLoadViewToggle={onLoadViewToggle}
      isCafeActive={isCafeActive}
      onCafeToggle={onCafeToggle}
    />
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutNotification, setShowLogoutNotification] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [showMyMarket, setShowMyMarket] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isLoadViewActive, setIsLoadViewActive] = useState(false);
  const [isLoadViewMinimized, setIsLoadViewMinimized] = useState(false);
  const [isCafeActive, setIsCafeActive] = useState(false);
  const [showMarketingArea, setShowMarketingArea] = useState(false);

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

  // 저장된 상권 열기 핸들러
  const handleSavedAreasClick = () => {
    setShowMyMarket(true);
    setIsCompareOpen(true);
  };

  const handleCompareTabClick = () => {
    setShowMyPage(false);
    setShowMyMarket(false);
    setIsCompareOpen(true);
  };

  // 저장된 상권 닫기 핸들러
  const handleMyMarketClose = () => {
    setShowMyMarket(false);
    setIsCompareOpen(false);
  };

  // 로드뷰 토글 핸들러
  const handleLoadViewToggle = (action: boolean | 'minimize' | 'restore') => {
    if (typeof action === 'boolean') {
      // true: 로드뷰 활성화
      setIsLoadViewActive(action);
      if (action) {
        setIsLoadViewMinimized(false); // 활성화 시 최소화 해제
      }
    } else if (action === 'minimize') {
      // 최소화: 로드뷰는 활성화 상태 유지, 최소화만 설정
      setIsLoadViewMinimized(true);
    } else if (action === 'restore') {
      // 복원: 최소화 해제
      setIsLoadViewMinimized(false);
    }
  };

  // 로드뷰 상태 변경 핸들러 (현재 사용하지 않음)
  const handleLoadViewStateChange = () => {
    // 상태 동기화로 인한 무한 루프 방지를 위해 주석 처리
    // setIsLoadViewActive(isActive);
    // setIsLoadViewMinimized(isMinimized);
  };

  // 카페 토글 핸들러
  const handleCafeToggle = (categoryId: string) => {
    console.log('카페 토글:', categoryId, '현재 상태:', isCafeActive);
    // 카테고리 ID가 'CE7'이면 카페 검색 토글
    if (categoryId === 'CE7') {
      const newState = !isCafeActive;
      console.log('카페 상태 변경:', isCafeActive, '->', newState);
      setIsCafeActive(newState);
    }
  };

  // 카페 상태 변경 감지
  useEffect(() => {
    console.log('HomePage isCafeActive 변경됨:', isCafeActive);
  }, [isCafeActive]);


  console.log('HomePage 렌더링 - isCafeActive:', isCafeActive);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 1) 풀스크린 카카오맵 (배경 고정) */}
      <KakaoMap cafeActive={isCafeActive} showMarketingArea={showMarketingArea}>
        {/* 좌측 네비게이션 바 */}
        <div className="fixed w-1/4 top-0 left-0 right-0 z-20">
          {showMyPage && (
            <MyPageMenu 
              onClose={handleMyPageClose}
              onSavedAreas={() => setIsCompareOpen(true)}
              onSavedAreasClose={() => setIsCompareOpen(false)}
            />
          )}
          {showMyMarket && (
            <MyMarket 
              onBack={handleMyMarketClose}
            />
          )}
          {!showMyPage && !showMyMarket && (
            <MainNavbar 
              onMyPageClick={handleMyPageClick} 
              onLoginModalOpen={() => setIsAuthOpen(true)}
              onSavedAreasClick={handleSavedAreasClick}
              onCompareClick={handleCompareTabClick}
              onMarketingAreaChange={setShowMarketingArea}
            />
          )}
        </div>

        

        {/* 2) 우측 버튼 바 (지도 타입 토글 포함) */}
        <MapTypeHandler 
          isLoggedIn={isLoggedIn} 
          onLogoutSuccess={handleLogoutSuccess}
          onLoginSuccess={handleLoginSuccess}
          isLoadViewActive={isLoadViewActive}
          isLoadViewMinimized={isLoadViewMinimized}
          onLoadViewToggle={handleLoadViewToggle}
          isCafeActive={isCafeActive}
          onCafeToggle={handleCafeToggle}
        />

        {/* 로드뷰 컴포넌트 - KakaoMap 내부에 배치하되 DOM 안정성 유지 */}
        <LoadView 
          isActive={isLoadViewActive}
          isMinimized={isLoadViewMinimized}
          onToggle={handleLoadViewToggle}
          onStateChange={handleLoadViewStateChange}
        />
      </KakaoMap>

      {/* Bottom-center CTA preview for verification */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <CtaPillButton
          label="상권 분석 자세히 보기"
          ariaLabel="상권 분석 자세히 보기"
          onPress={() => setIsDetailOpen(true)}
        />
      </div>

      {/* Area detail modal */}
      <AreaDetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="상권 현황"
      />

      {/* Compare modal: right-side overlay (covers right 75%) */}
      <CompareTradeAreasModal open={isCompareOpen} onClose={() => setIsCompareOpen(false)} leftOpen={false} />

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
