'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import ComparisonTray from '@/components/organisms/Compare/ComparisonTray';

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
  const [isSavedCompareOpen, setIsSavedCompareOpen] = useState(false);
  const [selectedTradeArea1, setSelectedTradeArea1] = useState<{ trdarCd: string; trdarCdNm: string } | null>(null);
  const [selectedTradeArea2, setSelectedTradeArea2] = useState<{ trdarCd: string; trdarCdNm: string } | null>(null);

  // 디버깅용 useEffect
  useEffect(() => {
    console.log('🔍 isSavedCompareOpen 상태 변화:', isSavedCompareOpen);
  }, [isSavedCompareOpen]);
  const [isLoadViewActive, setIsLoadViewActive] = useState(false);
  const [isLoadViewMinimized, setIsLoadViewMinimized] = useState(false);
  const [isCafeActive, setIsCafeActive] = useState(false);
  const [showMarketingArea, setShowMarketingArea] = useState(false);
  const [showMarketList, setShowMarketList] = useState(true);
  const [currentDistrict, setCurrentDistrict] = useState<string>('강남구');
  const [currentDong, setCurrentDong] = useState<string>('역삼동');
  const [selectedTradeAreaName, setSelectedTradeAreaName] = useState<string | null>(null);
  
  // 검색 결과 관련 상태 추가
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 최신 상태를 참조하기 위한 ref
  const showMarketListRef = useRef(showMarketList);
  const currentDistrictRef = useRef(currentDistrict);
  const currentDongRef = useRef(currentDong);

  // ref 업데이트
  useEffect(() => {
    showMarketListRef.current = showMarketList;
  }, [showMarketList]);

  useEffect(() => {
    currentDistrictRef.current = currentDistrict;
  }, [currentDistrict]);

  useEffect(() => {
    currentDongRef.current = currentDong;
  }, [currentDong]);

  // 상권 모드 상태 변화 디버깅
  useEffect(() => {
    console.log('🏠 HomePage - showMarketingArea 상태 변화:', showMarketingArea);
  }, [showMarketingArea]);

  // 상권 리스트 상태 변화 디버깅
  useEffect(() => {
    console.log('🏠 HomePage - showMarketList 상태 변화:', showMarketList);
  }, [showMarketList]);

  // 현재 주소 상태 변화 디버깅
  useEffect(() => {
    console.log('🏠 HomePage - currentDistrict/currentDong 상태 변화:', currentDistrict, currentDong);
  }, [currentDistrict, currentDong]);

  // 상권 리스트 표시 핸들러
  const handleShowMarketList = (district: string, dong: string) => {
    console.log('📋 상권 리스트 표시:', district, dong);
    setCurrentDistrict(district);
    setCurrentDong(dong);
    setShowMarketList(true);
  };

  // 상권 리스트 닫기 핸들러
  const handleMarketListClose = () => {
    console.log('🔄 상권 리스트 닫기');
    setShowMarketList(false);
    setCurrentDistrict('');
    setCurrentDong('');
  };

  // 주소 변경 핸들러 (지도 이동 시 자동 호출) - ref로 최신 상태 참조
  const handleAddressChange = useCallback((district: string, dong: string) => {
    console.log('🔄 주소 변경 감지:', district, dong);
    console.log('📊 현재 상권 리스트 상태 (state):', showMarketList);
    console.log('📊 현재 상권 리스트 상태 (ref):', showMarketListRef.current);
    console.log('📍 현재 저장된 주소 (state):', currentDistrict, currentDong);
    console.log('📍 현재 저장된 주소 (ref):', currentDistrictRef.current, currentDongRef.current);
    
    // ref를 사용해서 최신 상태 확인
    if (showMarketListRef.current) {
      console.log('📋 상권 리스트 자동 업데이트 실행 (ref 기반)');
      setCurrentDistrict(district);
      setCurrentDong(dong);
      console.log('✅ 새 주소로 상태 업데이트 완료:', district, dong);
    } else {
      console.log('❌ 상권 리스트가 닫혀있어서 업데이트 안함 (ref 기반)');
    }
  }, []); // 의존성 배열을 빈 배열로 하여 함수 재생성 방지

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
    setIsSavedCompareOpen(false);
    // 저장된 상권 모달이 닫힐 때 선택 상태 초기화
    setSelectedTradeArea1(null);
    setSelectedTradeArea2(null);
  };

  // 저장된 상권에서 비교하기 클릭 핸들러
  const handleSavedCompareClick = (selectedTradeAreas: { trdarCd: string; trdarCdNm: string }[]) => {
    console.log('🔍 handleSavedCompareClick 호출됨:', selectedTradeAreas);
    if (selectedTradeAreas.length === 0) {
      console.log('❌ 선택된 상권이 없음');
      return; // 선택된 상권이 없으면 아무것도 하지 않음
    }

    // 현재 선택된 상권 상태 확인
    const hasTradeArea1 = selectedTradeArea1 !== null;
    const hasTradeArea2 = selectedTradeArea2 !== null;

    if (selectedTradeAreas.length === 1) {
      // 1개 선택된 경우
      if (!hasTradeArea1) {
        // 상권 1이 비어있으면 상권 1에 추가
        setSelectedTradeArea1(selectedTradeAreas[0]);
      } else if (!hasTradeArea2) {
        // 상권 2가 비어있으면 상권 2에 추가
        setSelectedTradeArea2(selectedTradeAreas[0]);
      } else {
        // 둘 다 선택되어 있으면 상권 2에 덮어쓰기
        setSelectedTradeArea2(selectedTradeAreas[0]);
      }
    } else if (selectedTradeAreas.length === 2) {
      // 2개 선택된 경우 - 항상 덮어쓰기
      setSelectedTradeArea1(selectedTradeAreas[0]);
      setSelectedTradeArea2(selectedTradeAreas[1]);
    }

    // 저장된 상권 모달 열기
    console.log('✅ 저장된 상권 모달 열기 시도');
    setIsSavedCompareOpen(true);
  };

  // 검색 결과 관련 핸들러들
  const handleSearchResultsShow = useCallback((show: boolean, keyword: string) => {
    console.log('🔍 검색 결과 상태 변경:', { show, keyword });
    setShowSearchResults(show);
    setSearchKeyword(keyword);
    
    // 검색 결과가 표시되면 시장 목록 숨김
    if (show) {
      setShowMarketList(false);
    } else {
      // 검색 결과가 숨겨지면 시장 목록 다시 표시
      setShowMarketList(true);
    }
  }, []);

  const handleSearchClose = useCallback(() => {
    console.log('🔍 검색 결과 닫기');
    setShowSearchResults(false);
    setSearchKeyword('');
    // 검색 결과 닫을 때 시장 목록 다시 표시
    setShowMarketList(true);
  }, []);

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
      <KakaoMap 
        cafeActive={isCafeActive} 
        showMarketingArea={showMarketingArea}
        onTradeAreaSelect={setSelectedTradeAreaName}
        onShowMarketList={handleShowMarketList}
      >
        {/* 좌측 네비게이션 바 */}
        <div className="fixed w-1/4 top-0 left-0 right-0 z-20 h-screen flex flex-col">
          {showMyPage && (
            <MyPageMenu 
              onClose={handleMyPageClose}
              onSavedAreasClose={() => {
                setIsCompareOpen(false);
                setIsSavedCompareOpen(false);
                // 저장된 상권 모달이 닫힐 때 선택 상태 초기화
                setSelectedTradeArea1(null);
                setSelectedTradeArea2(null);
              }}
              onCompareClick={handleSavedCompareClick}
            />
          )}
          {showMyMarket && (
            <MyMarket 
              onBack={handleMyMarketClose}
              onCompareClick={handleSavedCompareClick}
            />
          )}
          {!showMyPage && !showMyMarket && (
            <MainNavbar 
              onMyPageClick={handleMyPageClick} 
              onLoginModalOpen={() => setIsAuthOpen(true)}
              onSavedAreasClick={handleSavedAreasClick}
              onCompareClick={handleCompareTabClick}
              onMarketingAreaChange={setShowMarketingArea}
              showMarketingArea={showMarketingArea}
              showMarketList={showMarketList}
              currentDistrict={currentDistrict}
              currentDong={currentDong}
              onMarketListClose={handleMarketListClose}
              // 검색 결과 관련 props 추가
              showSearchResults={showSearchResults}
              searchKeyword={searchKeyword}
              onSearchClose={handleSearchClose}
              onSearchResultsShow={handleSearchResultsShow}
              onAddressClick={handleShowMarketList}
              onAddressChange={handleAddressChange}
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

      {/* Bottom-center CTA preview for verification - 상권 선택 시에만 표시 */}
      {selectedTradeAreaName && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 max-w-[calc(100vw-2rem)]">
          <CtaPillButton
            label={`${selectedTradeAreaName} 상권 상세보기`}
            ariaLabel={`${selectedTradeAreaName} 상권 상세보기`}
            onPress={() => setIsDetailOpen(true)}
          />
        </div>
      )}

      {/* 비교함 담기 모달 - 항상 표시 */}
      {/* 비교함 담기 모달 - 상권비교 모달이 닫혀있을 때만 표시 */}
      {!isCompareOpen && (
        <ComparisonTray 
          onCompareClick={(area1, area2) => {
            setSelectedTradeArea1(area1);
            setSelectedTradeArea2(area2);
            setIsCompareOpen(true);
            setIsDetailOpen(false);
          }} 
        />
      )}

      {/* Area detail modal */}
      <AreaDetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="상권 현황"
      />

      {/* Compare modal: right-side overlay (covers right 75%) */}
      <CompareTradeAreasModal 
        open={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)} 
        modalType="compare"
        leftOpen={true}
        selectedTradeArea1={selectedTradeArea1}
        selectedTradeArea2={selectedTradeArea2}
      />

      {/* Saved areas compare modal */}
      <CompareTradeAreasModal 
        open={isSavedCompareOpen} 
        onClose={() => {
          console.log('🔍 저장된 상권 모달 닫기');
          setIsSavedCompareOpen(false);
          // 저장된 상권 모달이 닫힐 때 선택 상태 초기화
          setSelectedTradeArea1(null);
          setSelectedTradeArea2(null);
        }} 
        modalType="saved"
        leftOpen={!showMyMarket}
        preSelectedTradeAreas={[
          ...(selectedTradeArea1 ? [selectedTradeArea1] : []),
          ...(selectedTradeArea2 ? [selectedTradeArea2] : [])
        ]}
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
