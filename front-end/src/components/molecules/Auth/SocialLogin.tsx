'use client';

import React from 'react';
import SocialLoginButton from '../../atoms/Auth/Button/SocialLogin';
import { logger } from '@/utils/logger';

interface SocialLoginProps {
  className?: string;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ 
  className = "" 
}) => {
  const handleGoogleLogin = () => {
    logger.info('Google 로그인 클릭됨');
  };

  const handleSSAFYLogin = () => {
    logger.info('SSAFY 로그인 클릭됨');
  };

  return (
    <div className={`flex flex-col items-center gap-[10px] ${className}`}>
      <SocialLoginButton 
        provider="google" 
        onClick={handleGoogleLogin} 
      />
      
      <SocialLoginButton 
        provider="ssafy" 
        onClick={handleSSAFYLogin} 
      />
    </div>
  );
};

export default SocialLogin;