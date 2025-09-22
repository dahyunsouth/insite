"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { HeartIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { authManager } from "@/utils/auth";
import AuthModalWrapper from "@/components/templates/Auth/AuthModalWrapper";

type ActionButtonsProps = {
  onCompare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
  className?: string;
};

export default function ActionButtons({ 
  onCompare, 
  onSave, 
  isSaved = false, 
  isComparing = false,
  className = "" 
}: ActionButtonsProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    // 로그인 성공 후 원래 액션 실행
    if (onSave) onSave();
  };

  const handleSaveClick = () => {
    if (authManager.isLoggedIn()) {
      if (onSave) onSave();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleCompareClick = () => {
    if (authManager.isLoggedIn()) {
      if (onCompare) onCompare();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
        type="button"
        onClick={handleSaveClick}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border transition-colors duration-200 font-medium text-sm cursor-pointer ${
          isSaved 
            ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100" 
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <HeartIcon className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
        {isSaved ? "저장된 상권" : "저장하기"}
      </button>
       <button
         type="button"
         onClick={handleCompareClick}
         className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border transition-colors duration-200 font-medium text-sm cursor-pointer ${
           isComparing 
             ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100" 
             : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
         }`}
       >
         <ScaleIcon className={`h-4 w-4 ${isComparing ? "fill-current text-blue-500" : ""}`} />
         {isComparing ? "비교 중인 상권" : "비교함 담기"}
       </button>
      
      
    </div>

    {/* 로그인 모달 - Portal을 사용해서 document.body에 직접 렌더링 */}
    {isLoginModalOpen && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center py-8">
        {/* 배경 오버레이 */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsLoginModalOpen(false)}
        />
        
        {/* 모달 컨텐츠 */}
        <div className="relative z-10">
          <AuthModalWrapper 
            className="relative"
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
