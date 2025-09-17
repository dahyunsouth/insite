'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MapTypeToggleProps {
  onMapTypeChange?: (mapType: 'roadmap' | 'skyview') => void;
}

const MapTypeToggle: React.FC<MapTypeToggleProps> = ({ onMapTypeChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'skyview'>('roadmap');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  };

  const handleMapTypeChange = (type: 'roadmap' | 'skyview') => {
    setMapType(type);
    onMapTypeChange?.(type);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 기본 지도 아이콘 버튼 */}
      <button
        className={`
          w-12 h-12 bg-white rounded-2xl shadow-md hover:shadow-lg
          flex items-center justify-center
          text-gray-600
          transition-all duration-300 ease-in-out
          hover:bg-gray-100
          active:bg-gray-200
          focus:outline-none
          active:scale-[0.98]
          cursor-pointer
          ${isExpanded ? 'rounded-2xl' : 'rounded-2xl'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 7 
              Q6.5 5.5 9 4.5
              Q12 6 15 7
              Q17.5 5.5 20 4.5
              V17 
              Q17.5 18.5 15 19.5
              Q12 18.5 9 17
              Q6.5 18.5 4 19.5
              V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M9 5V17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M15 7V19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M19 7C19 9.5 16 13 16 13C16 13 13 9.5 13 7C13 5.3 14.3 4 16 4C17.7 4 19 5.3 19 7Z"
            fill="#FFFFFF"
            transform="translate(0,-2)"
          />

          <path
            d="M19 7C19 9.5 16 13 16 13C16 13 13 9.5 13 7C13 5.3 14.3 4 16 4C17.7 4 19 5.3 19 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0,-2)"
          />

          <circle
            cx="16"
            cy="5"
            r="1"
            fill="currentColor"
          />
        </svg>

      </button>

      {/* 확장된 토글 메뉴 */}
      <div
        className={`
          absolute right-0 top-0
          bg-white rounded-2xl shadow-lg
          overflow-hidden
          h-12
          flex h-full
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-40 opacity-100' : 'w-12 opacity-0'}
        `}
      >
          {/* 지도 버튼 */}
          <button
            className={`
              flex-1 px-4 text-sm font-medium whitespace-nowrap
              flex items-center justify-center
              m-1 rounded-2xl
              transition-all duration-300 ease-in-out
              cursor-pointer
              ${mapType === 'roadmap' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={() => handleMapTypeChange('roadmap')}
            style={{
              transitionDelay: isExpanded ? '0.1s' : '0s'
            }}
          >
            지도
          </button>

          {/* 스카이뷰 버튼 */}
          <button
            className={`
              flex-1 px-4 text-sm font-medium whitespace-nowrap
              flex items-center justify-center
              m-1 rounded-2xl
              transition-all duration-300 ease-in-out
              cursor-pointer
              ${mapType === 'skyview' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={() => handleMapTypeChange('skyview')}
            style={{
              transitionDelay: isExpanded ? '0.2s' : '0s'
            }}
          >
            스카이뷰
          </button>
      </div>
    </div>
  );
};

export default MapTypeToggle;
