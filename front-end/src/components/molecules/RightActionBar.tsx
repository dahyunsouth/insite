'use client';

import React from 'react';
import Image from 'next/image';

interface RightActionBarProps {
  className?: string;                 // 포지션/여백 커스터마이즈
  onMyPageClick?: () => void;         // 마이페이지 버튼 클릭
}

const RightActionBar: React.FC<RightActionBarProps> = ({
  className = '',
  onMyPageClick,
}) => {
  return (
    <div
      className={`
        fixed right-4 top-1/2 -translate-y-1/2 z-40
        flex flex-col items-center gap-3
        ${className}
      `}
    >
      {/* My Page 버튼 (패딩: 세로 12px, 가로 19px) */}
      <button
        type="button"
        aria-label="마이페이지"
        onClick={onMyPageClick}
        className={`
          inline-flex items-center justify-center
          px-[19px] py-[12px]
          rounded-2xl
          bg-transparent
          focus:outline-none focus:ring-2 focus:ring-black/40
          active:scale-[0.98] transition
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Image
          src="/images/MyPageButton.png"
          alt="마이페이지"
          width={40}
          height={40}
          priority
        />
      </button>
    </div>
  );
};

export default RightActionBar;
