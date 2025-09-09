import MenuBotton from '@/components/atoms/LeftNavbar/MenuButton';

type TotalMenuBarProps = {
  onSelectMarket?: () => void;
  onSelectMonthlySales?: () => void;
}

const TotalMenuBar = ({ onSelectMarket, onSelectMonthlySales }: TotalMenuBarProps) => {
  return (
    <div className='w-full px-3 py-2'>
      <MenuBotton 
        onChange={(active) => { 
          if (active === 'market' && onSelectMarket) onSelectMarket();
          if (active === 'sales' && onSelectMonthlySales) onSelectMonthlySales();
        }} 
      />
    </div>
  )
}

export default TotalMenuBar;

