'use client';

import React, { useState, useRef } from 'react';
import StoreSizeInfoModal from './Modal/StoreSizeInfoModal';

interface StoreSizeProps {
  onSizeChange?: (size: string | null) => void;
  initialValue?: string | null;
}

const StoreSize: React.FC<StoreSizeProps> = ({ 
  onSizeChange, 
  initialValue = null 
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(initialValue);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const handleSizeSelect = (size: string) => {
    const newValue = selectedSize === size ? null : size;
    setSelectedSize(newValue);
    onSizeChange?.(newValue);
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
          점포 규모
        </h3>
        {/* 안내 버튼 */}
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
        {/* 소형 버튼 */}
        <button
          onClick={() => handleSizeSelect('소형')}
          className={`
            cursor-pointer flex-1 py-3 px-4 rounded-lg border transition-all duration-200
            ${selectedSize === '소형'
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }
          `}
        >
          소형
        </button>

        {/* 중대형 버튼 */}
        <button
          onClick={() => handleSizeSelect('중대형')}
          className={`
            cursor-pointer flex-1 py-3 px-4 rounded-lg border transition-all duration-200
            ${selectedSize === '중대형'
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }
          `}
        >
          중대형
        </button>
      </div>

      {/* 정보 모달 */}
      <StoreSizeInfoModal 
        isVisible={isModalVisible}
        onClose={handleModalClose}
        buttonRef={infoButtonRef}
      />
    </div>
  );
};

export default StoreSize;
