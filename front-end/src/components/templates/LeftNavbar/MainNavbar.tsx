import React, { useState } from 'react';
import FirstLeftNavbar from '@/components/organisms/LeftNavbar/FirstLeftNavbar';
import SecondLeftNavbar from '@/components/organisms/LeftNavbar/SecondLeftNavbar';
// import ThirdLeftNavbar from '@/components/organisms/LeftNavbar/ThirdLeftNavbar';
import FourthLeftNavbar from '@/components/organisms/LeftNavbar/FourthLeftNavbar';
import FifthLeftNavbar from '@/components/organisms/LeftNavbar/FifthLeftNavbar';
import OpenButton from '@/components/atoms/Common/Button/OpenButton';
import CloseButton from '@/components/atoms/Common/Button/CloseButton';

interface MainNavbarProps {
  onMyPageClick?: () => void;
  onLoginModalOpen?: () => void;
  onSavedAreasClick?: () => void;
  onCompareClick?: () => void;
  onMarketingAreaChange?: (show: boolean) => void;
  showMarketingArea?: boolean;
  showMarketList?: boolean;
  currentDistrict?: string;
  currentDong?: string;
  onMarketListClose?: () => void;
  onAddressClick?: (district: string, dong: string) => void;
  onAddressChange?: (district: string, dong: string) => void;
  // SearchResultList 관련 props 추가
  showSearchResults?: boolean;
  searchKeyword?: string;
  onSearchClose?: () => void;
  onSearchReset?: () => void;
  onSearchResultsShow?: (show: boolean, keyword: string) => void;
  resetTrigger?: number;
  // 상권 선택 관련 props
  onTradeAreaSelect?: (tradeArea: any) => void;
  selectedTradeArea?: any;
  // DetailModal 관련 props
  onDetailModalClose?: () => void;
  // 네비게이션 바 상태 전달
  onNavbarStateChange?: (isOpen: boolean) => void;
  // 비교 모달 열림 여부(열림 시 z-index 상향)
  isCompareOpen?: boolean;
  // 브랜드 로고 클릭 시 동작
  onBrandClick?: () => void;
}

const MainNavbar: React.FC<MainNavbarProps> = ({ 
  // onMyPageClick, 
  onLoginModalOpen, 
  // onSavedAreasClick, 
  onCompareClick, 
  // onMarketingAreaChange, 
  // showMarketingArea,
  showMarketList,
  currentDistrict,
  currentDong,
  onMarketListClose,
  onAddressClick,
  onAddressChange,
  // SearchResultList 관련 props
  showSearchResults,
  searchKeyword,
  onSearchClose,
  onSearchReset,
  onSearchResultsShow,
  resetTrigger,
  // 상권 선택 관련 props
  onTradeAreaSelect,
  selectedTradeArea,
  // DetailModal 관련 props
  onDetailModalClose, 
  // 네비게이션 바 상태 전달
  onNavbarStateChange,
  isCompareOpen,
  onBrandClick
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onNavbarStateChange?.(newState);
  };

  return (
    <div className={`relative h-full ${isCompareOpen ? 'z-[500]' : 'z-[300]'}`}>
      {/* 네비게이션 바 */}
      <nav 
        className={`
          shadow-lg h-full flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-auto' : '-translate-x-full w-0'}
          overflow-hidden
        `}
      >
        <div className="flex-shrink-0">
          <FirstLeftNavbar onSearchResultsShow={onSearchResultsShow} resetTrigger={resetTrigger} onBrandClick={onBrandClick} />
        </div>
        <div className="flex-shrink-0">  
          <SecondLeftNavbar
            // onMyPageClick={onMyPageClick}
            onLoginModalOpen={onLoginModalOpen}
            // onSavedAreasClick={onSavedAreasClick}
            onCompareClick={onCompareClick}
            onDetailModalClose={onDetailModalClose}
          />
        </div>
        {/* <div className="flex-shrink-0">
          <ThirdLeftNavbar 
            onMarketingAreaChange={onMarketingAreaChange} 
            showMarketingArea={showMarketingArea}
          /> */}
        {/* </div> */}
        <div className="flex-shrink-0 border-b border-gray-300">
          <FourthLeftNavbar onAddressClick={onAddressClick} onAddressChange={onAddressChange} />
        </div>
        <div className="flex-1 min-h-0">
          <FifthLeftNavbar 
            isVisible={showMarketList || showSearchResults || false}
            district={currentDistrict || ''}
            dong={currentDong || ''}
            onClose={onMarketListClose || (() => {})}
            showSearchResults={showSearchResults || false}
            searchKeyword={searchKeyword || ''}
            onSearchClose={onSearchClose}
            onSearchReset={onSearchReset}
            onTradeAreaSelect={onTradeAreaSelect}
            selectedTradeArea={selectedTradeArea}
          />
        </div>
      </nav>
      
      {/* 토글 버튼 - 슬라이딩 애니메이션과 함께 */}
      <div 
        className={`
          absolute top-1/2 -translate-y-1/2 z-[310]
          transition-all duration-300 ease-in-out
          ${isOpen ? 'left-full' : 'left-0'}
        `}
      >
        {isOpen ? (
          <CloseButton onClick={handleToggle} />
        ) : (
          <OpenButton onClick={handleToggle} />
        )}
      </div>
    </div>
  );
};

export default MainNavbar;
