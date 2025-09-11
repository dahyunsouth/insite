'use client';

import React, { useRef, useEffect, useState } from 'react';

interface StoreRentalFeeInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const StoreRentalFeeInfoModal: React.FC<StoreRentalFeeInfoModalProps> = ({ isVisible, onClose, buttonRef }) => {
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
      className="fixed z-50 bg-white rounded-2xl shadow-lg p-6 max-w-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {/* 제목 */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        월 임대료
      </h2>
      
      {/* 임대료 설명 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-600 mb-2">
          임대료란?
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          점포를 임대할 때 매월 지불하는 비용으로, 보증금과 별도로 지불하는 월 고정비용입니다.
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          상권의 위치, 점포 규모, 시설 상태 등에 따라 결정됩니다.
        </p>
      </div>
      
      {/* 임대료 범위 설명 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          임대료 범위
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          <strong>0원 ~ 1억원</strong> 범위에서 설정할 수 있으며, 10만원 단위로 조정됩니다. 
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          예산에 맞는 적절한 임대료 범위를 설정하여 창업 가능한 상권을 찾아보세요.
        </p>
      </div>
      
      {/* 참고사항 */}
      <div>
        <h3 className="text-lg font-semibold text-orange-600 mb-2">
          참고사항
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          임대료 외에도 보증금, 관리비, 전기료 등 추가 비용이 있을 수 있으니 
          창업 계획 수립 시 참고하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};

export default StoreRentalFeeInfoModal;
