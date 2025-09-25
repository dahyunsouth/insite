'use client';

import React, { useEffect, useState } from 'react';

interface NotificationBarProps {
  message: string;
  isVisible: boolean;
  duration?: number; // 표시 시간 (밀리초)
  onClose?: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ 
  message, 
  isVisible, 
  duration = 3000,
  onClose 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="
        bg-black/70
        text-white
        px-6 py-3
        rounded-full
        text-sm font-medium
        shadow-lg
        animate-in slide-in-from-bottom-2 duration-300
      ">
        {message}
      </div>
    </div>
  );
};

export default NotificationBar;


