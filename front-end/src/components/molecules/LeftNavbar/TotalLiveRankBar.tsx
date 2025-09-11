import Live from '@/components/atoms/LeftNavbar/Live';
import LiveRank from '@/components/atoms/LeftNavbar/LiveRank';

const TotalLiveRankBar = () => {
  return (
    <div className="w-full flex items-center justify-between border-b border-gray-200 px-3 py-2">
      <div className="w-1/4 min-w-0">
        <Live className="w-full max-w-[200px]" />
      </div>
      <div className="w-3/4 min-w-0 ml-2 sm:ml-3">
        <LiveRank />
      </div>
    </div>
  );
}

export default TotalLiveRankBar;




