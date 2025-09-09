'use client';

import React from 'react';

interface LoginButtonProps {
  onClick?: () => void;
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      aria-label="로그인"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        w-12 h-12
        rounded-2xl
        bg-white
        shadow-md hover:shadow-lg
        text-gray-700 font-medium text-sm
        focus:outline-none
        active:scale-[0.98] transition-all duration-300 ease-in-out
        hover:bg-[#3288FF] hover:text-white hover:w-20
        overflow-hidden
        group
        cursor-pointer
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* 사용자 아이콘 (기본 상태) */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-gray-600 group-hover:hidden"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      
      {/* 로그인 텍스트 (호버 상태) */}
      <span className="hidden group-hover:block text-white font-medium text-sm whitespace-nowrap">
        로그인
      </span>
    </button>
  );
};

export default LoginButton;
