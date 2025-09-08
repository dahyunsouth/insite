import MarketingAreaHeader from '@/components/atoms/LeftNavbar/MarketingArea/MarketingAreaHeader';
import MarketingAreaRange from '@/components/atoms/LeftNavbar/MarketingArea/MarketingAreaRange';

type TotalMarketingAreaProps = {
  onClose?: () => void;
  onHelpClick?: () => void;
}

const TotalMarketingArea = ({ onClose, onHelpClick }: TotalMarketingAreaProps) => {
  return (
    <div className='w-full py-4 pr-4 pl-5'>
      <div className='mb-2'>
        <MarketingAreaHeader onClose={onClose} onHelpClick={onHelpClick} />
      </div>
      <MarketingAreaRange />
    </div>
  )
}

export default TotalMarketingArea;



