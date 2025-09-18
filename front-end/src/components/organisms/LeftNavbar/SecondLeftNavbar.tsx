"use client";

import React, { useState } from "react";

const TABS = ["뉴스", "상권비교", "저장된 상권", "마이페이지"] as const;
type Tab = typeof TABS[number];

interface SecondLeftNavbarProps {
  onMyPageClick?: () => void;
  onLoginModalOpen?: () => void;
  onSavedAreasClick?: () => void;
  onCompareClick?: () => void;
}

const SecondLeftNavbar: React.FC<SecondLeftNavbarProps> = ({
  onMyPageClick,
  onLoginModalOpen,
  onSavedAreasClick,
  onCompareClick,
}) => {
  const [active, setActive] = useState<Tab | null>(null);

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const authToken = localStorage.getItem('authToken');
    return !!authToken;
  };

  const baseBtn =
    "px-2 py-2 text-sm sm:text-base leading-none cursor-pointer select-none transition-all duration-150";

  return (
    <div className="w-full bg-[#3288FF] text-white">
      <nav className="w-full px-3 py-2">
        <div className="w-full flex items-center justify-between">
          {TABS.map((label) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (label === "마이페이지") {
                    // 로그인 상태 확인
                    if (checkLoginStatus()) {
                      // 로그인된 상태: 기존 동작 (마이페이지 열기)
                      onMyPageClick?.();
                    } else {
                      // 로그인되지 않은 상태: 로그인 모달 열기
                      onLoginModalOpen?.();
                    }
                  } else if (label === "저장된 상권") {
                    // 로그인 상태 확인
                    if (checkLoginStatus()) {
                      // 로그인된 상태: 저장된 상권 페이지 열기
                      onSavedAreasClick?.();
                    } else {
                      // 로그인되지 않은 상태: 로그인 모달 열기
                      onLoginModalOpen?.();
                    }
                  } else if (label === "상권비교") {
                    onCompareClick?.();
                  }
                  setActive((prev) => (prev === label ? null : label));
                }}
                className={
                  baseBtn +
                  (isActive
                    ? " font-semibold"
                    : " font-normal hover:font-semibold")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SecondLeftNavbar;
