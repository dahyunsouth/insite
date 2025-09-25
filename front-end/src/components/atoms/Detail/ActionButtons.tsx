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
  isLoading?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
};

export default function ActionButtons({ 
  onCompare, 
  onSave, 
  isSaved = false, 
  isComparing = false,
  isLoading = false,
  className = "",
  direction = 'vertical'
}: ActionButtonsProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'compare' | null>(null);

  const handleLoginSuccess = () => {
    console.log('💾 [ActionButtons] 로그인 성공 - 대기 중인 액션:', pendingAction);
    setIsLoginModalOpen(false);
    // 로그인 성공 후 원래 액션 실행
    if (pendingAction === 'save' && onSave) {
      console.log('💾 [ActionButtons] 로그인 후 저장 액션 실행');
      onSave();
    } else if (pendingAction === 'compare' && onCompare) {
      console.log('💾 [ActionButtons] 로그인 후 비교 액션 실행');
      onCompare();
    }
    setPendingAction(null);
  };

  const handleSaveClick = () => {
    console.log('💾 [ActionButtons] 저장 버튼 클릭됨');
    console.log('💾 [ActionButtons] 현재 저장 상태:', isSaved);
    console.log('💾 [ActionButtons] 로그인 상태:', authManager.isLoggedIn());
    
    if (authManager.isLoggedIn()) {
      console.log('💾 [ActionButtons] 로그인됨 - 저장 액션 실행');
      if (onSave) onSave();
    } else {
      console.log('💾 [ActionButtons] 로그인 필요 - 로그인 모달 표시');
      setPendingAction('save');
      setIsLoginModalOpen(true);
    }
  };

  const handleCompareClick = () => {
    console.log('비교 버튼 클릭됨');
    if (authManager.isLoggedIn()) {
      if (onCompare) onCompare();
    } else {
      setPendingAction('compare');
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <div className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} gap-2 ${className}`}>
        <button
        type="button"
        onClick={handleSaveClick}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border transition-colors duration-200 font-medium text-sm cursor-pointer active:scale-95 active:shadow-sm ${
          isSaved 
            ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200" 
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        }`}
      >
        <HeartIcon className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
        {/* {isLoading ? "처리 중..." : isSaved ? "저장된 상권" : "저장하기"} */}
        {isLoading ? "처리 중..." : isSaved ? "보관된 상권" : "보관함 담기"}
      </button>
       <button
         type="button"
         onClick={handleCompareClick}
         className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border transition-colors duration-200 font-medium text-sm cursor-pointer active:scale-95 active:shadow-sm ${
           isComparing 
             ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200" 
             : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
         }`}
       >
         <ScaleIcon className={`h-4 w-4 ${isComparing ? "fill-current text-blue-500" : ""}`} />
         {isComparing ? "비교 중인 상권" : "비교함 담기"}
       </button>
      
      
    </div>

    {/* 로그인 모달 - Portal을 사용해서 document.body에 직접 렌더링 */}
    {isLoginModalOpen && createPortal(
      <div className="fixed inset-0 z-[510] flex items-center justify-center py-8">
        {/* 배경 오버레이 */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
          onClick={() => {
            setIsLoginModalOpen(false);
            setPendingAction(null);
          }}
        />
        
        {/* 모달 컨텐츠 */}
        <div className="relative z-10">
          <AuthModalWrapper 
            className="relative"
            onClose={() => {
              setIsLoginModalOpen(false);
              setPendingAction(null);
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
