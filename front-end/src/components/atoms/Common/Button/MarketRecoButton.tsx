"use client";

import React, { useState } from 'react';

interface MarketRecoButtonProps {
  onClick?: () => void;
  className?: string;
}

const MarketRecoButton: React.FC<MarketRecoButtonProps> = ({ onClick, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer h-10 flex items-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 hover:from-cyan-400 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden ${isHovered ? 'w-32 justify-center px-2' : 'w-10 justify-center'} ${className}`}
      aria-label="상권 추천"
    >
      {/* 배경 그라데이션 물결 효과 - #00FFB2와 #3288FF 메인 조합! */}
      <div className={`absolute inset-0 transition-opacity duration-400 animate-pulse ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(0deg, #00FFB2, #3288FF)' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-450 animate-pulse ${isHovered ? 'opacity-95' : 'opacity-0'}`} style={{ background: 'linear-gradient(30deg, #3288FF, #00FFB2)', animationDelay: '0.1s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-500 animate-pulse ${isHovered ? 'opacity-90' : 'opacity-0'}`} style={{ background: 'linear-gradient(60deg, #00FFB2, #4D9AFF)', animationDelay: '0.2s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-550 animate-pulse ${isHovered ? 'opacity-85' : 'opacity-0'}`} style={{ background: 'linear-gradient(90deg, #1A76FF, #1AFFCC)', animationDelay: '0.3s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-600 animate-pulse ${isHovered ? 'opacity-80' : 'opacity-0'}`} style={{ background: 'linear-gradient(120deg, #00FFB2, #6BB6FF)', animationDelay: '0.4s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-450 animate-pulse ${isHovered ? 'opacity-75' : 'opacity-0'}`} style={{ background: 'linear-gradient(150deg, #5DADE2, #33FFD5)', animationDelay: '0.5s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-500 animate-pulse ${isHovered ? 'opacity-70' : 'opacity-0'}`} style={{ background: 'linear-gradient(180deg, #3288FF, #00FFAA)', animationDelay: '0.6s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-550 animate-pulse ${isHovered ? 'opacity-65' : 'opacity-0'}`} style={{ background: 'linear-gradient(210deg, #00E6A0, #4D9AFF)', animationDelay: '0.7s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-400 animate-pulse ${isHovered ? 'opacity-60' : 'opacity-0'}`} style={{ background: 'linear-gradient(240deg, #3288FF, #66FFE6)', animationDelay: '0.8s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-450 animate-pulse ${isHovered ? 'opacity-55' : 'opacity-0'}`} style={{ background: 'linear-gradient(270deg, #00B395, #74B3FF)', animationDelay: '0.9s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-500 animate-pulse ${isHovered ? 'opacity-50' : 'opacity-0'}`} style={{ background: 'linear-gradient(300deg, #1976D2, #00CCAA)', animationDelay: '1.0s' }}></div>
      <div className={`absolute inset-0 transition-opacity duration-550 animate-pulse ${isHovered ? 'opacity-45' : 'opacity-0'}`} style={{ background: 'linear-gradient(330deg, #80FFE6, #1E88E5)', animationDelay: '1.1s' }}></div>
      
      {/* SVG 아이콘 - 기본 상태에서도 항상 보이도록 */}
      <div className="flex items-center justify-center relative z-10">
        <svg
          className="w-5 h-5 animate-spin drop-shadow-lg"
          style={{ animationDuration: '3s' }}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 0
             C10 4, 4 10, 0 12
             C4 14, 10 20, 12 24
             C14 20, 20 14, 24 12
             C20 10, 14 4, 12 0 Z"
            fill="white"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.8"
          />
        </svg>
      </div>
      
      {/* 텍스트 - 호버 시에만 표시 */}
      <span className={`text-white text-sm font-bold transition-all duration-300 whitespace-nowrap drop-shadow-lg relative z-10 ${isHovered ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}>
        상권 추천
      </span>
    </button>
  );
};

export default MarketRecoButton;