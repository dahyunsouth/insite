"use client";

import React, { forwardRef } from 'react';

interface MarketRecoButtonProps {
  onClick?: () => void;
  className?: string;
}

const MarketRecoButton = forwardRef<HTMLButtonElement, MarketRecoButtonProps>(({ onClick, className = "" }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`cursor-pointer h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500 hover:from-cyan-400 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden ${className}`}
      aria-label="상권 추천 메뉴"
    >
      {/* SVG 아이콘 - 돌아가는 애니메이션 */}
      <svg
        className="w-5 h-5 hover:animate-spin drop-shadow-lg"
        style={{ animationDuration: '3s' }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0
           C10 4, 4 10, 0 12
           C4 14, 10 20, 12 24
           C14 20, 20 14, 24 12
           C20 10, 14 4, 12 0 Z"
          fill="white"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.8"
        />
      </svg>
    </button>
  );
});

MarketRecoButton.displayName = 'MarketRecoButton';

export default MarketRecoButton;