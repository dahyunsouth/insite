'use client';

import React from 'react';

interface MyPageMenuProps {
  onEditInfo?: () => void;
  onSavedAreas?: () => void;
  className?: string;
}

const MyPageMenu: React.FC<MyPageMenuProps> = ({
  onEditInfo,
  onSavedAreas,
  className = ''
}) => {
  return (
    <div className={`bg-white ${className}`}>
      {/* 저장된 상권 메뉴 */}
      <button
        onClick={onSavedAreas}
        className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-gray-900 font-medium">저장된 상권</span>
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* 구분선 */}
      <div className="border-b border-gray-200"></div>
      
      {/* 내 정보 수정 메뉴 */}
      <button
        onClick={onEditInfo}
        className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-gray-900 font-medium">내 정보 수정</span>
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* 구분선 */}
      <div className="border-b border-gray-200"></div>

      {/* 비밀번호 변경 메뉴 */}
      <button
        onClick={onEditInfo}
        className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-gray-900 font-medium">비밀번호 변경</span>
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* 구분선 */}
      <div className="border-b border-gray-200"></div>
    </div>
  );
};

export default MyPageMenu;
