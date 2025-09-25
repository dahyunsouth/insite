'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import KakaoMap, { useKakaoMapContext } from '@/components/map/KakaoMap';
import LoadView from '@/components/map/LoadView';
import RightActionBar from '@/components/organisms/RightActionBar/RightActionBar';
import LoginBar from '@/components/organisms/RightActionBar/LoginBar';
import CtaPillButton from '@/components/molecules/Detail/CtaPillButton/CtaPillButton';
import DetailModal from '@/components/organisms/Detail/DetailModal';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import MainNavbar from '@/components/templates/LeftNavbar/MainNavbar';
import MyPageMenu from '@/components/templates/MyPage/MyPage';
import MyMarket from '@/components/templates/MyPage/MyMarket';
import NotificationBar from '@/components/atoms/Common/NotificationBar';
import CompareTradeAreasModal from '@/components/organisms/Compare/CompareTradeAreasModal';
import ComparisonTray from '@/components/organisms/Compare/ComparisonTray';
import NewCompareModal from '@/components/organisms/Compare/NewCompareModal';
import TradeAreaData from '@/data/TradeAreaValue.json';
import { useNotification } from '@/components/map/useNotification';
import Notification from '@/components/map/Notification';
import { tmToWgs84 } from '@/utils/coordinateTransform';
import { useComparisonStore } from '@/stores/comparisonStore';

// 지도 타입 변경 핸들러 컴포넌트
function MapTypeHandler({ 
  isLoggedIn, 
  onLogoutSuccess,
  onLoginSuccess,
  isLoadViewActive,
  isLoadViewMinimized,
  onLoadViewToggle,
  isCafeActive,
  onCafeToggle,
  onCompareClick,
  onMyPageClick,
  onSavedAreasClick
}: { 
  isLoggedIn: boolean;
  onLogoutSuccess: () => void;
  onLoginSuccess: () => void;
  isLoadViewActive: boolean;
  isLoadViewMinimized: boolean;
  onLoadViewToggle: (action: boolean | 'minimize' | 'restore') => void;
  isCafeActive: boolean;
  onCafeToggle: (categoryId: string) => void;
  onCompareClick: () => void;
  onMyPageClick: () => void;
  onSavedAreasClick: () => void;
}) {
  const mapContext = useKakaoMapContext();
  
  const handleMapTypeChange = (mapType: 'roadmap' | 'skyview') => {
    mapContext?.setMapType(mapType);
  };

  return (
    <>
      {/* 우측 상단: 로그인 관련 버튼들 */}
      <LoginBar 
        isLoggedIn={isLoggedIn}
        onLogoutSuccess={onLogoutSuccess}
        onLoginSuccess={onLoginSuccess}
        onSavedAreasClick={onSavedAreasClick}
        onCompareClick={onCompareClick}
        onProfileClick={onMyPageClick}
        onSavedAreasClick={onSavedAreasClick}
      />
      
      {/* 우측 하단: 지도 컨트롤 버튼들 */}
      <RightActionBar 
        onMapTypeChange={handleMapTypeChange} 
        isLoadViewActive={isLoadViewActive}
        isLoadViewMinimized={isLoadViewMinimized}
        onLoadViewToggle={onLoadViewToggle}
        isCafeActive={isCafeActive}
        onCafeToggle={onCafeToggle}
      />
    </>
  );
}

// 지도 줌 레벨이 6 이상일 때는 CTA를 숨기는 가드 컴포넌트
function CtaVisibilityGuard({ label, ariaLabel, onPress }: { label: string | null; ariaLabel: string; onPress: () => void }) {
  const mapContext = useKakaoMapContext();
  const [zoomLevel, setZoomLevel] = React.useState<number>(() => {
    try {
      return mapContext?.getZoomLevel() ?? 3;
    } catch {
      return 3;
    }
  });

  React.useEffect(() => {
    const map = mapContext?.map as any;
    if (!map || !(window as any)?.kakao?.maps?.event) return;

    const handler = () => {
      try {
        setZoomLevel(mapContext?.getZoomLevel() ?? 3);
      } catch {
        // ignore
      }
    };

    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', handler);
    // 초기 동기화
    handler();
    return () => {
      try {
        (window as any).kakao.maps.event.removeListener(map, 'zoom_changed', handler);
      } catch {
        // ignore
      }
    };
  }, [mapContext]);

  if (!label) return null;
  if (zoomLevel >= 6) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 max-w-[calc(100vw-2rem)]">
      <CtaPillButton
        label={label}
        ariaLabel={ariaLabel}
        onPress={onPress}
      />
    </div>
  );
}

// 상권코드로 상권명을 찾는 함수
const getTradeAreaNameByCode = (trdarCode: string): string | null => {
  const tradeArea = TradeAreaData.DATA.find(area => area.trdar_cd === trdarCode);
  return tradeArea ? tradeArea.trdar_cd_nm : null;
};

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
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
  
  // 새로운 상권 비교 모달 상태
  const [isNewCompareModalOpen, setIsNewCompareModalOpen] = useState(false);
  
  // Zustand store에서 비교함 상태 관리
  const { 
    comparisonTray, 
    addToComparison, 
    removeFromComparison, 
    isInComparison 
  } = useComparisonStore();

  // 비교함에 상권 추가 (알림 포함)
  const addToComparisonTray = (trdarCd: string, trdarCdNm: string) => {
    const currentLength = comparisonTray.length;
    const exists = comparisonTray.some(item => item.trdarCd === trdarCd);
    
    if (exists) {
      showNotification('이미 비교함에 담긴 상권입니다.');
      return;
    }
    
    if (currentLength >= 2) {
      showNotification('비교함에는 최대 2개까지만 담을 수 있습니다.');
      return;
    }
    
    addToComparison(trdarCd, trdarCdNm);
    showNotification('비교함에 추가되었습니다.');
  };

  // 비교함에서 상권 제거
  const removeFromComparisonTray = (trdarCd: string) => {
    removeFromComparison(trdarCd);
  };

  // 디버깅용 useEffect
  useEffect(() => {
    console.log('🔍 isSavedCompareOpen 상태 변화:', isSavedCompareOpen);
  }, [isSavedCompareOpen]);
  const [isLoadViewActive, setIsLoadViewActive] = useState(false);
  const [isLoadViewMinimized, setIsLoadViewMinimized] = useState(false);
  const [isCafeActive, setIsCafeActive] = useState(false);
  const [showMarketingArea, setShowMarketingArea] = useState(false);
  const [showMarketList, setShowMarketList] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<string>('');
  const [currentDong, setCurrentDong] = useState<string>('');
  const [selectedTradeAreaName, setSelectedTradeAreaName] = useState<string | null>(null);
  const [selectedTradeAreaCode, setSelectedTradeAreaCode] = useState<string | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  
  // 검색 결과 관련 상태 추가
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [resetTrigger, setResetTrigger] = useState(0);
  
  // 상권 선택 관련 상태 추가
  const [selectedTradeArea, setSelectedTradeArea] = useState<any>(null);

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
    
    // 상세보기 안내바도 숨기기
    setSelectedTradeAreaName(null);
    setSelectedTradeAreaCode(null);
    setSelectedTradeArea(null);
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

  // 마이페이지 열기 핸들러 (열 때 보관함 닫기)
  const handleMyPageClick = () => {
    setShowMyMarket(false);
    setShowMyPage(true);
  };

  // 마이페이지 닫기 핸들러
  const handleMyPageClose = () => {
    setShowMyPage(false);
  };

  // 저장된 상권 열기 핸들러 (열 때 마이페이지 닫기)
  const handleSavedAreasClick = () => {
    setShowMyPage(false);
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

  // 다른 모달(비교/저장된 비교)이 열릴 때 상권 추천 드롭다운 닫기
  useEffect(() => {
    if (isCompareOpen || isSavedCompareOpen || isDetailOpen || showMyPage || showMyMarket) {
      window.dispatchEvent(new CustomEvent('marketreco:close'));
    }
  }, [isCompareOpen, isSavedCompareOpen, isDetailOpen, showMyPage, showMyMarket]);

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

  const handleSearchReset = useCallback(() => {
    console.log('🔍 검색창 초기화');
    setResetTrigger(prev => prev + 1);
  }, []);

  // 상권 폴리곤과 라벨 스타일 업데이트 함수
  const updateTradeAreaStyle = useCallback((trdarCode: string, trdarName: string) => {
    console.log('🎨 상권 스타일 업데이트:', { trdarCode, trdarName });
    
    // 이전에 선택된 상권 스타일 초기화
    const previousSelected = document.querySelector('.tradearea-label.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
      // 기본 스타일로 복원 (TradeAreaPoligon.tsx 기본과 동일)
      const prevElement = previousSelected as HTMLElement;
      prevElement.style.zIndex = '100';
      prevElement.style.transform = 'scale(1)';
      prevElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      prevElement.style.backgroundColor = '#3288FF';
      prevElement.style.color = '#ffffff';
      prevElement.style.textShadow = 'none';
      prevElement.style.padding = '6px 12px';
      prevElement.style.fontSize = '12px';
      prevElement.style.fontWeight = 'bold';
      prevElement.style.textAlign = 'center';
      prevElement.style.whiteSpace = 'nowrap';
      prevElement.style.pointerEvents = 'auto';
      prevElement.style.cursor = 'pointer';
      prevElement.style.borderRadius = '6px';
      prevElement.style.border = '1px solid rgba(50, 136, 255, 0.8)';
      prevElement.style.transition = 'all 0.2s ease';
      prevElement.style.position = 'relative';
      // 내부 SVG/텍스트 색상도 기본(흰색)으로 복원
      const prevSvg = prevElement.querySelector('svg') as HTMLElement | null;
      if (prevSvg) prevSvg.style.color = '#ffffff';
      const prevTextContainer = prevElement.querySelector('div[style*="flex-direction: column"]');
      if (prevTextContainer) {
        const prevTextDivs = prevTextContainer.querySelectorAll('div');
        prevTextDivs.forEach((el) => ((el as HTMLElement).style.color = '#ffffff'));
      }
    }
    
    // 새로운 상권 라벨 찾기 및 스타일 적용
    const labelElements = document.querySelectorAll('.tradearea-label');
    let targetLabel: HTMLElement | null = null;
    
    labelElements.forEach((label) => {
      const labelElement = label as HTMLElement;
      if (labelElement.textContent?.includes(trdarName)) {
        targetLabel = labelElement;
      }
    });
    
    if (targetLabel) {
      console.log('✅ 상권 라벨 찾음, 스타일 적용:', targetLabel);
      
      // 선택된 상태 클래스 추가
      targetLabel.classList.add('selected');
      // 선택된 상권 스타일 적용 (TradeAreaPoligon.tsx 클릭 효과와 동일)
      targetLabel.style.zIndex = '10000';
      targetLabel.style.transform = 'scale(1.05)';
      targetLabel.style.boxShadow = '0 4px 12px rgba(50, 136, 255, 0.4)';
      targetLabel.style.backgroundColor = '#ffffff';
      targetLabel.style.color = '#000000';
      targetLabel.style.textShadow = 'none';
      targetLabel.style.padding = '6px 12px';
      targetLabel.style.fontSize = '12px';
      targetLabel.style.fontWeight = 'bold';
      targetLabel.style.textAlign = 'center';
      targetLabel.style.whiteSpace = 'nowrap';
      targetLabel.style.pointerEvents = 'auto';
      targetLabel.style.cursor = 'pointer';
      targetLabel.style.borderRadius = '6px';
      targetLabel.style.border = '1px solid rgba(50, 136, 255, 0.8)';
      targetLabel.style.transition = 'all 0.2s ease';
      targetLabel.style.position = 'relative';

      // 내부 요소 색상 동기화 (이름: 검정, 매출/보조: 파랑)
      const svgElement = targetLabel.querySelector('svg') as HTMLElement | null;
      if (svgElement) svgElement.style.color = '#000000';
      const textContainer = targetLabel.querySelector('div[style*="flex-direction: column"]');
      if (textContainer) {
        const [nameEl, salesEl] = Array.from(textContainer.querySelectorAll('div')) as HTMLElement[];
        if (nameEl) nameEl.style.color = '#000000';
        if (salesEl) salesEl.style.color = '#3288FF';
      }
      
      console.log('🎨 상권 라벨 스타일 적용 완료');
    } else {
      console.log('❌ 상권 라벨을 찾을 수 없음:', trdarName);
    }
  }, []);

  // 상권 선택 핸들러
  const handleTradeAreaSelect = useCallback((tradeArea: any) => {
    console.log('🏪 상권 선택됨:', tradeArea);
    
    // 선택된 상권 상태 업데이트
    setSelectedTradeArea(tradeArea);
    
    // 상세보기 안내바를 위한 상태 업데이트
    setSelectedTradeAreaName(tradeArea.trdarCdNm);
    setSelectedTradeAreaCode(tradeArea.trdarCd);
    
    // TM 좌표를 WGS84로 변환
    const wgs84Coords = tmToWgs84(tradeArea.xcntsValue, tradeArea.ydntsValue);
    console.log('📍 좌표 변환 완료:', {
      tm: { x: tradeArea.xcntsValue, y: tradeArea.ydntsValue },
      wgs84: wgs84Coords
    });
    
    // 지도 이동 이벤트 발생
    const focusEvent = new CustomEvent('focusTradeArea', {
      detail: {
        code: tradeArea.trdarCd,
        name: tradeArea.trdarCdNm,
        coordinates: {
          lat: wgs84Coords.lat,
          lng: wgs84Coords.lng
        }
      }
    });
    
    window.dispatchEvent(focusEvent);
    console.log('🗺️ 지도 이동 이벤트 발생:', {
      code: tradeArea.trdarCd,
      name: tradeArea.trdarCdNm,
      coordinates: wgs84Coords
    });
    
    // 상권 폴리곤과 라벨 스타일 변경
    setTimeout(() => {
      updateTradeAreaStyle(tradeArea.trdarCd, tradeArea.trdarCdNm);
      
      // 폴리곤 스타일 변경을 위한 커스텀 이벤트 발생
      const styleEvent = new CustomEvent('selectTradeArea', {
        detail: {
          code: tradeArea.trdarCd,
          name: tradeArea.trdarCdNm
        }
      });
      window.dispatchEvent(styleEvent);
    }, 100); // 지도 이동 후 스타일 변경
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
        onTradeAreaSelect={(name, code) => {
          console.log("🔍 상권 선택:", { name, code });
          setSelectedTradeAreaName(name);
          setSelectedTradeAreaCode(code);
        }}
        onShowMarketList={handleShowMarketList}
      >
        {/* 좌측 네비게이션 바 */}
        <div className={`fixed top-0 left-0 right-0 ${isCompareOpen || isSavedCompareOpen ? 'z-[500]' : 'z-[300]'} h-screen flex flex-col transition-all duration-300 ease-in-out ${isNavbarOpen ? 'w-1/4' : 'w-0'}`}>
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
              onDetailClick={(trdarCd, trdarCdNm) => {
                setSelectedTradeAreaCode(trdarCd);
                setSelectedTradeAreaName(trdarCdNm);
                setIsDetailOpen(true);
                // MyMarket 모달은 그대로 유지
              }}
            />
          )}
          {!showMyPage && !showMyMarket && (
            <MainNavbar 
              onMyPageClick={handleMyPageClick} 
              onLoginModalOpen={() => setIsAuthOpen(true)}
              onSavedAreasClick={handleSavedAreasClick}
              onCompareClick={handleCompareTabClick}
              onNavbarStateChange={setIsNavbarOpen}
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
              onSearchReset={handleSearchReset}
              onSearchResultsShow={handleSearchResultsShow}
              resetTrigger={resetTrigger}
              onAddressClick={handleShowMarketList}
              onAddressChange={handleAddressChange}
              // 상권 선택 관련 props 추가
              onTradeAreaSelect={handleTradeAreaSelect}
              selectedTradeArea={selectedTradeArea}
              // DetailModal 관련 props
              onDetailModalClose={() => setIsDetailOpen(false)}
              // 비교 모달 열림 여부 전달 (열림 시 z-index 상향)
              isCompareOpen={isCompareOpen || isSavedCompareOpen}
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
          onCompareClick={handleCompareTabClick}
          onMyPageClick={handleMyPageClick}
          onSavedAreasClick={handleSavedAreasClick}
        />

        {/* 로드뷰 컴포넌트 - KakaoMap 내부에 배치하되 DOM 안정성 유지 */}
        <LoadView 
          isActive={isLoadViewActive}
          isMinimized={isLoadViewMinimized}
          onToggle={handleLoadViewToggle}
          onStateChange={handleLoadViewStateChange}
        />

      {/* Bottom-center CTA - 줌 레벨 6 이상이면 숨김 (Provider 내부) */}
      <CtaVisibilityGuard 
        label={selectedTradeAreaName ? `${selectedTradeAreaName} 상권 상세보기` : null}
        ariaLabel={selectedTradeAreaName ? `${selectedTradeAreaName} 상권 상세보기` : '상권 상세보기'}
        onPress={() => setIsDetailOpen(true)}
      />
      </KakaoMap>


      {/* 비교함 담기 모달 - 비교함에 상권이 1개 이상일 때만 표시 */}
      {!isCompareOpen && comparisonTray.length > 0 && (
        <ComparisonTray 
          comparisonItems={comparisonTray}
          onRemoveItem={removeFromComparisonTray}
          onCompareClick={(area1, area2) => {
            setSelectedTradeArea1(area1);
            setSelectedTradeArea2(area2);
            setIsCompareOpen(true);
            setIsDetailOpen(false);
          }} 
        />
      )}

      {/* Area detail modal */}
      <DetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedTradeAreaName ? selectedTradeAreaName : "상권 현황"}
        trdarCode={selectedTradeAreaCode}
        onAddToComparison={addToComparisonTray}
        onRemoveFromComparison={removeFromComparisonTray}
        isInComparison={isInComparison}
        isNavbarOpen={isNavbarOpen}
      />

      {/* Compare modal: right-side overlay (covers right 75%) */}
      <CompareTradeAreasModal 
        open={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)} 
        modalType="compare"
        leftOpen={true}
        selectedTradeArea1={selectedTradeArea1}
        selectedTradeArea2={selectedTradeArea2}
        navbarOpen={isNavbarOpen}
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
        navbarOpen={isNavbarOpen}
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

      {/* 토스트 알림 */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[400]">
        <Notification
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      </div>

      {/* 새로운 상권 비교 모달 테스트 버튼 */}
      {/* <div className="fixed top-20 right-4 z-[500]">
        <button
          onClick={() => setIsNewCompareModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          새 상권 비교 모달 테스트
        </button>
      </div> */}

      {/* 새로운 상권 비교 모달 */}
      <NewCompareModal 
        open={isNewCompareModalOpen}
        onClose={() => setIsNewCompareModalOpen(false)}
        navbarOpen={isNavbarOpen}
      />

    </div>
  );
}
