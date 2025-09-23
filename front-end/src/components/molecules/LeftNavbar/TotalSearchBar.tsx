import BrandLogo from '@/components/atoms/LeftNavbar/BrandLogo';
import SearchBar from '@/components/atoms/LeftNavbar/SearchBar';

interface TotalSearchBarProps {
  onSearchResultsShow?: (show: boolean, keyword: string) => void;
  resetTrigger?: number;
}

const TotalSearchBar = ({ onSearchResultsShow, resetTrigger }: TotalSearchBarProps) => {
  return (
    <div className="w-full flex-col items-center justify-between bg-[#3288FF] px-4 pt-4 min-h-[clamp(32px,3.2vw,44px)]">
      <div className="shrink-0 flex items-center px-3 pt-1 pb-4">
        <BrandLogo />
      </div>
      <div className="flex bg-white py-2 p items-center justify-end flex-1 ml-1.5 min-w-0">
        <SearchBar onSearchResultsShow={onSearchResultsShow} resetTrigger={resetTrigger} />
      </div>
    </div>
  );
}

export default TotalSearchBar;


