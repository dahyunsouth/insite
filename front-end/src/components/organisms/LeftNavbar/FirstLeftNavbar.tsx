import TotalSearchBar from '@/components/molecules/LeftNavbar/TotalSearchBar';
// import TotalLiveRankBar from '@/components/molecules/LeftNavbar/TotalLiveRankBar';
// import TotalFilterBar from '@/components/molecules/LeftNavbar/TotalFilterBar';

interface FirstLeftNavbarProps {
  onSearchResultsShow?: (show: boolean, keyword: string) => void;
  resetTrigger?: number;
  onBrandClick?: () => void;
}

const FirstLeftNavbar = ({ onSearchResultsShow, resetTrigger, onBrandClick }: FirstLeftNavbarProps) => {
  return (
    <div className="w-full bg-white flex flex-col items-center">
      <div className="w-full border-b border-gray-300">
        <TotalSearchBar onSearchResultsShow={onSearchResultsShow} resetTrigger={resetTrigger} onBrandClick={onBrandClick} />
      </div>
      <div className="w-full">
        {/* <TotalLiveRankBar /> */}
      </div>
      <div className='w-full'>
        {/* <TotalFilterBar /> */}
      </div>
    </div>
  );
}

export default FirstLeftNavbar;


