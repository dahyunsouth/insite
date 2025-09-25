"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "상권추천" | "상권비교";

interface SecondLeftNavbarProps {
  onLoginModalOpen?: () => void;
  onCompareClick?: () => void;
  onDetailModalClose?: () => void;
}

const SecondLeftNavbar: React.FC<SecondLeftNavbarProps> = ({
  onLoginModalOpen,
  onCompareClick,
  onDetailModalClose,
}) => {
  const [active, setActive] = useState<Tab | null>(null);
  const router = useRouter();

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const authToken = localStorage.getItem('authToken');
    return !!authToken;
  };

  // 기본 버튼 스타일
  const baseBtn = "rounded-lg p-4 w-full text-sm sm:text-base leading-none cursor-pointer select-none transition-all duration-150";
  
  // 각 버튼별 스타일 정의
  const getButtonStyle = (label: string, isActive: boolean) => {
    const baseStyle = baseBtn;
    
    switch (label) {
      case "상권추천":
        return `${baseStyle} bg-[#3288FF] text-white space-y-4 ${
          isActive ? 'shadow-lg' : 'hover:shadow-xl'
        }`;
      
        case "상권비교":
        return `${baseStyle} bg-[#5AB8E2] text-white space-y-4 ${
          isActive ? 'shadow-lg' : 'hover:shadow-xl'
        }`;
      
      default:
        return `${baseStyle} bg-gray-500 text-white `;
    }
  };

  return (
    <div className="w-full bg-white py-3 px-2 border-b border-gray-300 text-white">
      <nav className="w-full px-3 py-2">
        {/* <div className="text-lg font-normal text-gray-900 ml-2 mb-3">
          <span className="text-2xl font-bold text-blue-500">Insite</span>에서 지금 <strong className="text-green-700">주목할 서비스!</strong></div> */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* 상권추천 버튼 */}
          <button
            type="button"
            aria-pressed={active === "상권추천"}
            onClick={() => {
              // 로그인 상태 확인
              if (checkLoginStatus()) {
                // 로그인된 상태: 상권 추천 페이지로 이동
                router.push('/marketrecommendation');
              } else {
                // 로그인되지 않은 상태: 로그인 모달 열기
                onLoginModalOpen?.();
              }
              setActive((prev) => (prev === "상권추천" ? null : "상권추천"));
            }}
            className={getButtonStyle("상권추천", active === "상권추천")}
          >
            <div className="text-left space-y-1">
              <div className="text-xl font-bold">상권 추천</div>
              <div className="text-xs font-light text-white opacity-50">Trade Area Recommendation</div>
            </div>
            <div className="flex items-center justify-end">
              <div className="border-2 border-white rounded-full w-7 h-7 flex items-center justify-center">→</div>
            </div>
          </button>

          {/* 상권비교 버튼 */}
          <button
            type="button"
            aria-pressed={active === "상권비교"}
            onClick={() => {
            // 로그인 상태 확인
            if (checkLoginStatus()) {
              // 로그인된 상태: 비교 기능 실행 전 DetailModal 닫기
              onDetailModalClose?.();
              onCompareClick?.();
            } else {
              // 로그인되지 않은 상태: 로그인 모달 열기
              onLoginModalOpen?.();
            }
              setActive((prev) => (prev === "상권비교" ? null : "상권비교"));
            }}
            className={getButtonStyle("상권비교", active === "상권비교")}
          >
            <div className="text-left space-y-1">
              <div className="text-xl font-bold">상권 비교</div>
              <div className="text-xs font-light text-white opacity-50">Trade Area <br /> Comparison</div>
            </div>
            <div className="flex items-center justify-end">
              <div className="border-2 border-white rounded-full w-7 h-7 flex items-center justify-center">→</div>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default SecondLeftNavbar;
