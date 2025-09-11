'use client';

import React from 'react';

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl p-8 mx-4 max-w-md w-full">
        {/* 안내 문구 */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-left">
            회원탈퇴
          </h2>
          <p className="text-gray-600 text-left leading-relaxed">
            정말로 회원탈퇴를 하시겠습니까?<br />
            탈퇴 후에는 모든 데이터가 삭제되며
            복구할 수 없습니다.
          </p>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-3">
          
          {/* 회원탈퇴 버튼 */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`cursor-pointer px-6 py-2 text-gray-300 bg-gray-100 rounded-lg hover:bg-red-500 hover:text-white active:bg-red-600 active:text-white transition-colors duration-200 font-medium ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '처리중...' : '회원탈퇴'}
          </button>

          {/* 돌아가기 버튼 */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`cursor-pointer px-6 py-2 text-white bg-gray-500 rounded-lg hover:bg-[#3288FF] active:bg-[#2a73e6] transition-colors duration-200 font-medium ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteModal;
