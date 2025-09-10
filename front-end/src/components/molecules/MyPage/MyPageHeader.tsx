'use client';

import React from 'react';
import BtnBack from '@/components/atoms/Common/Button/BtnBack';

interface MyPageHeaderProps {
  onBackClick?: () => void;
  className?: string;
}

const MyPageHeader: React.FC<MyPageHeaderProps> = ({
  onBackClick,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-start gap-2 ${className}`}>
      <BtnBack onClick={onBackClick} />
      <h1 className="text-lg font-semibold text-gray-900">마이페이지</h1>
    </div>
  );
};

export default MyPageHeader;
