"use client";

import React from 'react';
import NowAddress from '@/components/atoms/LeftNavbar/NowAddress';

interface FourthLeftNavbarProps {
  onAddressClick?: (district: string, dong: string) => void;
  onAddressChange?: (district: string, dong: string) => void;
}

const FourthLeftNavbar: React.FC<FourthLeftNavbarProps> = ({ onAddressClick, onAddressChange }) => {
  return (
    <div className="w-full bg-white flex flex-col items-center">
      <div className='w-full'>
        <NowAddress onAddressClick={onAddressClick} onAddressChange={onAddressChange} />
      </div>
    </div>
  );
};

export default FourthLeftNavbar;
