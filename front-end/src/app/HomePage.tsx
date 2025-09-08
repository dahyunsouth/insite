'use client';

import React, { useEffect, useState } from 'react';
import KakaoMap from '@/components/map/KakaoMap';
import RightActionBar from '@/components/organisms/RightActionBar';
import AuthModalWrapper from '@/components/templates/Auth/AuthModalWrapper';
import MainNavbar from '@/components/templates/Auth/LeftNavbar/MainNavbar';

export default function HomePage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // (선택) 모달 열렸을 때 페이지 스크롤 잠금
  useEffect(() => {
    if (isAuthOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isAuthOpen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 1) 풀스크린 카카오맵 (배경 고정) */}
      <KakaoMap />

      {/* 상단 네비게이션 바 */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <MainNavbar />
      </div>

      {/* 2) 우측 버튼 바 (마이페이지 버튼만 우선 배치) */}
      <RightActionBar onMyPageClick={() => setIsAuthOpen(true)} />

      {/* 3) 인증 모달 (AuthModalWrapper) - 조건부 렌더 */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50"
        onClick={() => setIsAuthOpen(false)}
        >
          {/* 딤 영역 */}
          <div
            className="absolute inset-0 bg-black/40"
          />
          {/* 모달 본체 */}
          <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
            <div
              className="w-[360px]"
              onClick={(e) => e.stopPropagation()} // 딤 클릭 닫기와 구분
            >
              <AuthModalWrapper className="w-[360px]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}