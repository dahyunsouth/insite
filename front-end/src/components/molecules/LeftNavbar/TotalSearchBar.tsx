import BrandLogo from '@/components/atoms/LeftNavbar/BrandLogo';
import SearchBar from '@/components/atoms/LeftNavbar/SearchBar';

interface TotalSearchBarProps {
  onSearchResultsShow?: (show: boolean, keyword: string) => void;
  resetTrigger?: number;
}

const TotalSearchBar = ({ onSearchResultsShow, resetTrigger }: TotalSearchBarProps) => {
  return (
    <div className="w-full flex items-center justify-between border-b border-gray-200 px-4 py-4 min-h-[clamp(32px,3.2vw,44px)]">
      <div className="shrink-0 flex items-center min-w-[40px]">
        <BrandLogo />
      </div>
      <div className="flex items-center justify-end flex-1 ml-1.5 min-w-0">
        <SearchBar onSearchResultsShow={onSearchResultsShow} resetTrigger={resetTrigger} />
      </div>
    </div>
  );
}

export default TotalSearchBar;


