'use client';

import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false,
  });

  const showNotification = useCallback((message: string, duration?: number) => {
    setNotification({
      message,
      isVisible: true,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
