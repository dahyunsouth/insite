'use client';

import React, { useRef, useEffect, useState } from 'react';

interface MarketTypeInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const MarketTypeInfoModal: React.FC<MarketTypeInfoModalProps> = ({ isVisible, onClose, buttonRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.top,
        left: buttonRect.right + 10 // 버튼 오른쪽에 10px 간격
      });
    }
  }, [isVisible, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose, buttonRef]);

  if (!isVisible) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed z-50 bg-white rounded-2xl shadow-lg p-6 max-w-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          발달/골목 상권
        </h2>
        
        {/* 발달상권 정의 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
            발달상권
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            대형 상가, 백화점, 쇼핑몰 등이 밀집한 상업지구로, 
            높은 유동인구와 다양한 상권이 발달한 지역입니다. 
            접근성이 좋고 상권의 안정성이 높아 창업 시 성공 가능성이 높은 편입니다.
          </p>
        </div>
        
        {/* 골목상권 정의 */}
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">
            골목상권
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            주거지역 내 골목길이나 소규모 상가가 모여있는 지역으로, 
            지역 주민들을 주요 고객으로 하는 상권입니다. 
            대형 상권에 비해 임대료가 저렴하고 지역 특색을 살린 창업이 가능합니다.
          </p>
        </div>
    </div>
  );
};

export default MarketTypeInfoModal;
