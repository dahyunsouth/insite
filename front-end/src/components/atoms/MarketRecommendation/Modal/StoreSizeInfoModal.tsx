'use client';

import React, { useRef, useEffect, useState } from 'react';

interface StoreSizeInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const StoreSizeInfoModal: React.FC<StoreSizeInfoModalProps> = ({ isVisible, onClose, buttonRef }) => {
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
        점포 규모
      </h2>
      
      {/* 소형 정의 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-600 mb-2">
          소형
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          면적이 작은 점포로, 일반적으로 10평 이하의 규모입니다. 
          카페, 편의점, 소규모 매장 등에 적합하며, 
          초기 창업비용이 적고 관리가 용이한 장점이 있습니다.
        </p>
      </div>
      
      {/* 중대형 정의 */}
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          중대형
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          면적이 큰 점포로, 일반적으로 10평 이상의 규모입니다. 
          레스토랑, 대형 매장, 쇼핑몰 등에 적합하며, 
          다양한 상품 진열과 고객 수용이 가능한 장점이 있습니다.
        </p>
      </div>
    </div>
  );
};

export default StoreSizeInfoModal;
