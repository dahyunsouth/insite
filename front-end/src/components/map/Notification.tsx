'use client';

import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  duration?: number; // 알림 표시 시간 (밀리초)
  onClose?: () => void;
  onClick?: () => void; // 클릭 이벤트 핸들러 추가
}

const Notification: React.FC<NotificationProps> = ({
  message,
  isVisible,
  duration = 3000,
  onClose,
  onClick,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className="bg-black/70 bg-opacity-80 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-black/80 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center justify-center">
          <span className="text-sm font-medium whitespace-nowrap">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Notification;


