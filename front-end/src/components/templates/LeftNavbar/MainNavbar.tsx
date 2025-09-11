import React from 'react';
import FirstLeftNavbar from '@/components/organisms/LeftNavbar/FirstLeftNavbar';
import SecondLeftNavbar from '@/components/organisms/LeftNavbar/SecondLeftNavbar';
import ThirdLeftNavbar from '@/components/organisms/LeftNavbar/ThirdLeftNavbar';

interface MainNavbarProps {
  onMyPageClick?: () => void;
  onLoginModalOpen?: () => void;
  onSavedAreasClick?: () => void;
}

const MainNavbar: React.FC<MainNavbarProps> = ({ onMyPageClick, onLoginModalOpen, onSavedAreasClick }) => {
  return (
    <nav className="pt-2 pl-2 space-y-1">
      <FirstLeftNavbar />
      <SecondLeftNavbar onMyPageClick={onMyPageClick} onLoginModalOpen={onLoginModalOpen} onSavedAreasClick={onSavedAreasClick} />
      <ThirdLeftNavbar />
    </nav>
  );
}

export default MainNavbar;


