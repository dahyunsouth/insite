'use client';

import React, { useState, useRef } from 'react';
import MarketTypeInfoModal from './Modal/MarketTypeInfoModal';

interface MarketTypeProps {
  onMarketTypeChange?: (marketType: string | null) => void;
  initialValue?: string | null;
}

const MarketType: React.FC<MarketTypeProps> = ({ 
  onMarketTypeChange, 
  initialValue = null 
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(initialValue);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const handleTypeSelect = (type: string) => {
    const newValue = selectedType === type ? null : type;
    setSelectedType(newValue);
    onMarketTypeChange?.(newValue);
  };

  const handleInfoButtonClick = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6">
      {/* 제목 섹션 */}
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 mr-2">
          발달/골목상권
        </h3>
        {/* 안내 모달 */}
        <button 
          ref={infoButtonRef}
          className="cursor-pointer w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
          onClick={handleInfoButtonClick}
        >
          <span className="text-gray-600 text-white text-xs font-medium">i</span>
        </button>
      </div>

      {/* 선택 버튼들 */}
      <div className="flex gap-3">
        {/* 발달상권 버튼 */}
        <button
          onClick={() => handleTypeSelect('발달상권')}
          className={`
            cursor-pointer flex-1 py-3 px-4 rounded-lg border transition-all duration-200
            ${selectedType === '발달상권'
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }
          `}
        >
          발달상권
        </button>

        {/* 골목상권 버튼 */}
        <button
          onClick={() => handleTypeSelect('골목상권')}
          className={`
            cursor-pointer flex-1 py-3 px-4 rounded-lg border transition-all duration-200
            ${selectedType === '골목상권'
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500hover:border-gray-400'
            }
          `}
        >
          골목상권
        </button>
      </div>

      {/* 정보 모달 */}
      <MarketTypeInfoModal 
        isVisible={isModalVisible}
        onClose={handleModalClose}
        buttonRef={infoButtonRef}
      />
    </div>
  );
};

export default MarketType;
