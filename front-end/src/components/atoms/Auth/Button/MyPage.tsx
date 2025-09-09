'use client';

import React from 'react';
import Image from 'next/image';

type MyPageButtonProps = {
  className?: string;
  onClick?: () => void;   // 페이지에서 이 핸들러로 AuthModalWrapper 오픈
  size?: number;          // 아이콘 픽셀 크기 (기본 48)
  ariaLabel?: string;     // 접근성 라벨 (기본 '마이페이지')
};

const MyPageButton: React.FC<MyPageButtonProps> = ({
  className = '',
  onClick,
  size = 40,
  ariaLabel = '마이페이지',
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-2xl
        bg-transparent
        focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40
        active:scale-[0.98] transition
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Image
        src="/images/MyPageButton.png"   // public/images/MyPageButton.png
        alt={ariaLabel}
        width={size}
        height={size}
        priority
      />
    </button>
  );
};

export default MyPageButton;
