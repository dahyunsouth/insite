import TotalSearchBar from '@/components/molecules/LeftNavbar/TotalSearchBar';
import TotalLiveRankBar from '@/components/molecules/LeftNavbar/TotalLiveRankBar';
// import TotalFilterBar from '@/components/molecules/LeftNavbar/TotalFilterBar';

interface FirstLeftNavbarProps {
  onSearchResultsShow?: (show: boolean, keyword: string) => void;
}

const FirstLeftNavbar = ({ onSearchResultsShow }: FirstLeftNavbarProps) => {
  return (
    <div className="w-full bg-white flex flex-col items-center">
      <div className="w-full">
        <TotalSearchBar onSearchResultsShow={onSearchResultsShow} />
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


