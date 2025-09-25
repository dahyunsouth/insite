'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserDeleteModal from '../../atoms/Auth/UserDeleteModal';
import { useUser } from '../../../contexts/UserContext';

interface MyPageMenuProps {
  onEditInfo?: () => void;
  onSavedAreas?: () => void;
  onPasswordUpdate?: () => void;
  onUserDelete?: () => void;
  className?: string;
}

const MyPageMenu: React.FC<MyPageMenuProps> = ({
  onEditInfo,
  onSavedAreas,
  onPasswordUpdate,
  onUserDelete,
  className = ''
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { deleteUser } = useUser();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteUser();
      if (success) {
        setIsDeleteModalOpen(false);
        // 홈페이지로 리다이렉트
        router.push('/');
      } else {
        // 실패 시 모달은 유지하고 에러 메시지는 UserContext에서 처리
        console.error('회원탈퇴 실패');
      }
    } catch (error) {
      console.error('회원탈퇴 중 오류 발생:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };
  return (
    <div className={`bg-white ${className}`}>
      {/* 저장된 상권 메뉴 */}
      <button
        onClick={onSavedAreas}
        className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-gray-900 font-medium">상권 보관함</span>
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
        onClick={onPasswordUpdate}
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

      {/* 회원탈퇴 메뉴 */}
      <button
        onClick={handleDeleteClick}
        className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-gray-900 font-medium">회원탈퇴</span>
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
      
      {/* 회원탈퇴 모달 */}
      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyPageMenu;
