import MenuBotton from '@/components/atoms/LeftNavbar/MenuButton';

type TotalMenuBarProps = {
  onSelectMarket?: () => void;
}

const TotalMenuBar = ({ onSelectMarket }: TotalMenuBarProps) => {
  return (
    <div className='w-full px-3 py-2'>
      <MenuBotton onChange={(active) => { if (active === 'market' && onSelectMarket) onSelectMarket(); }} />
    </div>
  )
}

export default TotalMenuBar;

