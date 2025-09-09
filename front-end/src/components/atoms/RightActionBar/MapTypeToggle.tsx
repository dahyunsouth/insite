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
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
          ${isExpanded ? 'w-36 opacity-100' : 'w-0 opacity-0'}
        `}
      >
          {/* 지도 버튼 */}
          <button
            className={`
              flex-1 px-2 text-xs font-medium whitespace-nowrap
              flex items-center justify-center
              m-1 rounded-2xl
              transition-colors duration-200
              cursor-pointer
              ${mapType === 'roadmap' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
            onClick={() => handleMapTypeChange('roadmap')}
          >
            지도
          </button>

          {/* 스카이뷰 버튼 */}
          <button
            className={`
              flex-1 px-2 text-xs font-medium whitespace-nowrap
              flex items-center justify-center
              m-1 rounded-2xl
              transition-colors duration-200
              cursor-pointer
              ${mapType === 'skyview' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
            onClick={() => handleMapTypeChange('skyview')}
          >
            스카이뷰
          </button>
      </div>
    </div>
  );
};

export default MapTypeToggle;
