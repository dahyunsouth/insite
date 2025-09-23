import React from 'react';
import FirstLeftNavbar from '@/components/organisms/LeftNavbar/FirstLeftNavbar';
import SecondLeftNavbar from '@/components/organisms/LeftNavbar/SecondLeftNavbar';
// import ThirdLeftNavbar from '@/components/organisms/LeftNavbar/ThirdLeftNavbar';
import FourthLeftNavbar from '@/components/organisms/LeftNavbar/FourthLeftNavbar';
import FifthLeftNavbar from '@/components/organisms/LeftNavbar/FifthLeftNavbar';

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
}

const MainNavbar: React.FC<MainNavbarProps> = ({ 
  onMyPageClick, 
  onLoginModalOpen, 
  onSavedAreasClick, 
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
  onDetailModalClose
}) => {
  return (
    <nav className="shadow-lg py-2 pl-2 space-y-1 h-full flex flex-col">
      <div className="flex-shrink-0">
        <FirstLeftNavbar onSearchResultsShow={onSearchResultsShow} resetTrigger={resetTrigger} />
      </div>
      <div className="flex-shrink-0">
        <SecondLeftNavbar
          onMyPageClick={onMyPageClick}
          onLoginModalOpen={onLoginModalOpen}
          onSavedAreasClick={onSavedAreasClick}
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
      <div className="flex-shrink-0">
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
  );
};

export default MainNavbar;
