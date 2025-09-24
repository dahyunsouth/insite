"use client";

import React from "react";
import DetailKakaoMap from "@/components/atoms/Detail/DetailKakaoMap";
import AiPrompt from "@/components/atoms/Detail/AiPrompt";
import ActionButtons from "@/components/atoms/Detail/ActionButtons";

type TradeAreaIntroCardProps = {
  trdarCode?: string | null;
  areaName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  onViewLargeMap?: () => void;
  ranking?: number;
  showActionButtons?: boolean;
  onSave?: () => void;
  onCompare?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
  isLoading?: boolean;
  actionButtonsDirection?: 'horizontal' | 'vertical';
};

/**
 * Molecule: TradeAreaIntroCard
 * - 상권 소개 카드 컴포넌트
 * - 왼쪽: AI 상권 소개 텍스트, 오른쪽: 상권 중심 지도
 */
export default function TradeAreaIntroCard({ 
  trdarCode, 
  areaName, 
  coordinates,
  onViewLargeMap,
  ranking,
  showActionButtons = false,
  onSave,
  onCompare,
  isSaved = false,
  isComparing = false,
  isLoading = false,
  actionButtonsDirection = 'vertical'
}: TradeAreaIntroCardProps) {
  return (
    <div className="w-full">
      <h3 className="text-[18px] font-semibold text-gray-900 mb-4">상권 소개</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        
        {/* 오른쪽: 상권 중심 지도 */}
        <div className="flex flex-col">
          <DetailKakaoMap 
            coordinates={coordinates}
            areaName={areaName}
          />
          
          {/* 크게보기 버튼 */}
          <button
            onClick={onViewLargeMap}
            className="mt-4 w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            크게보기
          </button>
          
          {/* ActionButtons - 상권 추천에서만 표시 */}
          {showActionButtons && (
            <div className="mt-4">
              <ActionButtons
                onSave={onSave}
                onCompare={onCompare}
                isSaved={isSaved}
                isComparing={isComparing}
                isLoading={isLoading}
                direction={actionButtonsDirection}
              />
            </div>
          )}
        </div>
        
        {/* 왼쪽: AI 상권 소개 텍스트 */}
        <div className="flex flex-col">
          <AiPrompt 
            areaName={areaName}
            trdarCode={trdarCode}
            ranking={ranking}
          />
        </div>
      </div>
    </div>
  );
}
