'use client';

import React, { useState, useCallback, useRef } from 'react';
import StoreRentalFeeInfoModal from './Modal/StoreRentalFeeInfoModal';

interface StoreRentalFeeProps {
  onFeeChange?: (minFee: number, maxFee: number) => void;
  initialMinFee?: number;
  initialMaxFee?: number;
  initialHasInteracted?: boolean;
}

const StoreRentalFee: React.FC<StoreRentalFeeProps> = ({ 
  onFeeChange, 
  initialMinFee = 0,
  initialMaxFee = 100000000,
  initialHasInteracted = false
}) => {
  // 숫자를 천 단위 콤마로 포맷팅
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  const [minFee, setMinFee] = useState<number>(initialMinFee);
  const [maxFee, setMaxFee] = useState<number>(initialMaxFee);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(initialHasInteracted);
  const [minInputValue, setMinInputValue] = useState<string>(formatNumber(initialMinFee));
  const [maxInputValue, setMaxInputValue] = useState<string>(formatNumber(initialMaxFee));
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [showSliderMessage, setShowSliderMessage] = useState<boolean>(false);
  const [isDragEnding, setIsDragEnding] = useState<boolean>(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const minValue = 0;
  const maxValue = 100000000; // 1억원

  // 초기값들이 변경될 때 상태 동기화
  React.useEffect(() => {
    setMinFee(initialMinFee);
    setMaxFee(initialMaxFee);
    setHasInteracted(initialHasInteracted);
    setMinInputValue(formatNumber(initialMinFee));
    setMaxInputValue(formatNumber(initialMaxFee));
  }, [initialMinFee, initialMaxFee, initialHasInteracted]);


  // 퍼센트를 값으로 변환
  const percentToValue = (percent: number): number => {
    return Math.round((percent / 100) * (maxValue - minValue) + minValue);
  };

  // 값을 퍼센트로 변환
  const valueToPercent = (value: number): number => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  const handleMinFeeChange = useCallback((newMinFee: number) => {
    // 10만원 단위로 반올림
    const roundedMinFee = Math.round(newMinFee / 100000) * 100000;
    const clampedMinFee = Math.min(Math.max(roundedMinFee, minValue), maxFee - 100000);
    setMinFee(clampedMinFee);
    setMinInputValue(formatNumber(clampedMinFee)); // 입력창도 업데이트
    setHasInteracted(true);
    onFeeChange?.(clampedMinFee, maxFee);
  }, [maxFee, onFeeChange]);

  const handleMaxFeeChange = useCallback((newMaxFee: number) => {
    // 10만원 단위로 반올림
    const roundedMaxFee = Math.round(newMaxFee / 100000) * 100000;
    const clampedMaxFee = Math.max(Math.min(roundedMaxFee, maxValue), minFee + 100000);
    setMaxFee(clampedMaxFee);
    setMaxInputValue(formatNumber(clampedMaxFee)); // 입력창도 업데이트
    setHasInteracted(true);
    onFeeChange?.(minFee, clampedMaxFee);
  }, [minFee, onFeeChange]);

  const handleSliderMouseDown = (type: 'min' | 'max') => {
    setIsDragging(type);
    setShowSliderMessage(false); // 핸들러 드래그 시작 시 메시지 숨김
  };

  const handleSliderMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // 슬라이더 컨테이너의 위치를 가져오기 위해 ref 사용
    const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
    if (!sliderContainer) return;

    const rect = sliderContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const value = percentToValue(percent);

    if (isDragging === 'min') {
      handleMinFeeChange(value);
    } else {
      handleMaxFeeChange(value);
    }
  }, [isDragging, handleMinFeeChange, handleMaxFeeChange]);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(null);
    setIsDragEnding(true);
    // 드래그 종료 후 잠시 동안 클릭 이벤트 무시
    setTimeout(() => {
      setIsDragEnding(false);
    }, 100);
  }, []);

  // 전역 마우스 이벤트 리스너 등록/해제
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleSliderMouseMove);
      document.addEventListener('mouseup', handleSliderMouseUp);
      // 드래그 중일 때 body에 cursor-pointer 클래스 추가
      document.body.style.cursor = 'pointer';
    } else {
      // 드래그가 끝나면 cursor 스타일 제거
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleSliderMouseMove);
      document.removeEventListener('mouseup', handleSliderMouseUp);
      // 컴포넌트 언마운트 시 cursor 스타일 제거
      document.body.style.cursor = '';
    };
  }, [isDragging, handleSliderMouseMove, handleSliderMouseUp]);

  const handleInputChange = (type: 'min' | 'max', value: string) => {
    // 입력값을 그대로 저장 (사용자가 입력하는 동안)
    if (type === 'min') {
      setMinInputValue(value);
    } else {
      setMaxInputValue(value);
    }
  };

  const processInputValue = (type: 'min' | 'max') => {
    const inputValue = type === 'min' ? minInputValue : maxInputValue;
    const numValue = parseInt(inputValue.replace(/,/g, '')) || 0;
    setHasInteracted(true);
    
    if (type === 'min') {
      // 10만원 단위로 반올림
      const roundedMinFee = Math.round(numValue / 100000) * 100000;
      const clampedMinFee = Math.min(Math.max(roundedMinFee, minValue), maxFee - 100000);
      setMinFee(clampedMinFee);
      setMinInputValue(formatNumber(clampedMinFee)); // 반올림된 값으로 입력창 업데이트
      onFeeChange?.(clampedMinFee, maxFee); // 업데이트된 값 사용
    } else {
      // 10만원 단위로 반올림
      const roundedMaxFee = Math.round(numValue / 100000) * 100000;
      const clampedMaxFee = Math.max(Math.min(roundedMaxFee, maxValue), minFee + 100000);
      setMaxFee(clampedMaxFee);
      setMaxInputValue(formatNumber(clampedMaxFee)); // 반올림된 값으로 입력창 업데이트
      onFeeChange?.(minFee, clampedMaxFee); // 업데이트된 값 사용
    }
  };

  const handleInputBlur = (type: 'min' | 'max') => {
    processInputValue(type);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent, type: 'min' | 'max') => {
    if (e.key === 'Enter') {
      processInputValue(type);
    }
  };

  const handleInfoButtonClick = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSliderBarClick = (e: React.MouseEvent) => {
    // 드래그 중이거나 드래그 종료 직후에는 이벤트 무시
    if (isDragging || isDragEnding) {
      e.stopPropagation();
      return;
    }
    
    // 슬라이더 바를 직접 클릭했을 때 메시지 표시
    setShowSliderMessage(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6">
      {/* 제목 섹션 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-bold text-gray-900 mr-2">
          월 임대료
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
        {/* 입력 필드들 */}
        <div className="flex items-center gap-2">
            <input
            type="text"
            value={minInputValue}
            onChange={(e) => handleInputChange('min', e.target.value)}
            onBlur={() => handleInputBlur('min')}
            onKeyPress={(e) => handleInputKeyPress(e, 'min')}
            className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-center text-gray-700 focus:outline-none focus:border-blue-500"
            />
            <span className="text-gray-500">~</span>
            <input
            type="text"
            value={maxInputValue}
            onChange={(e) => handleInputChange('max', e.target.value)}
            onBlur={() => handleInputBlur('max')}
            onKeyPress={(e) => handleInputKeyPress(e, 'max')}
            className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-center text-gray-700 focus:outline-none focus:border-blue-500"
            />
            <span className="text-gray-500 ml-1">원</span>
        </div>
      </div>


      {/* 슬라이더 */}
      <div className="relative">
        <div
          className="slider-container relative h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleSliderBarClick}
        >
          {/* 선택된 범위 */}
          <div
            className={`absolute h-2 rounded-full ${
              hasInteracted ? 'bg-blue-500' : 'bg-gray-400'
            }`}
            style={{
              left: `${valueToPercent(minFee)}%`,
              width: `${valueToPercent(maxFee) - valueToPercent(minFee)}%`
            }}
          />
          
          {/* 최소값 핸들 */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 rounded-full shadow-md cursor-pointer transform -translate-y-1.5 -translate-x-2.5 ${
              hasInteracted ? 'border-blue-500' : 'border-gray-400'
            }`}
            style={{ left: `${valueToPercent(minFee)}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleSliderMouseDown('min');
            }}
          />
          
          {/* 최대값 핸들 */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 rounded-full shadow-md cursor-pointer transform -translate-y-1.5 -translate-x-2.5 ${
              hasInteracted ? 'border-blue-500' : 'border-gray-400'
            }`}
            style={{ left: `${valueToPercent(maxFee)}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleSliderMouseDown('max');
            }}
          />
        </div>

        {/* 범위 라벨 */}
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>0</span>
          <span>1억원</span>
        </div>
      </div>

      {/* 슬라이더 안내 메시지 */}
      {showSliderMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">
            핸들러를 이용해 월 임대료의 최소/최대값을 설정하세요.
          </p>
        </div>
      )}

      {/* 정보 모달 */}
      <StoreRentalFeeInfoModal 
        isVisible={isModalVisible}
        onClose={handleModalClose}
        buttonRef={infoButtonRef}
      />
    </div>
  );
};

export default StoreRentalFee;
