'use client';

import React from 'react';
import AuthenticationCard from '../../atoms/Auth/Card/Authentication';
import AuthenticationLabel from '../../atoms/Auth/Heading/Authentication';
import LoginForm from '../../molecules/Auth/LoginForm';
import SignUpPrompt from '../../molecules/Auth/SignUpPrompt';
import SocialLoginHeader from '../../atoms/Auth/Label/SocialLoginHeader';
import SocialLoginForm from '../../molecules/Auth/SocialLogin';

interface LoginOrganismProps {
  className?: string;
  onSignUpClick?: () => void;   // ✅ 추가
  onClose?: () => void;  // 모달 닫기 콜백
  onLoginSuccess?: () => void;  // 로그인 성공 콜백
  // signUpHref?: string;          // (선택) 라우팅 링크 사용 시
}

const LoginOrganism: React.FC<LoginOrganismProps> = ({ 
  className = "flex flex-col items-center justify-center",
  onSignUpClick,
  onClose,
  onLoginSuccess,
  // signUpHref,
}) => {
  return (
    <AuthenticationCard className={className}>
      <div className="w-full">
        <AuthenticationLabel type="login" />
      </div>
      
      <div className="w-full">
        <LoginForm onClose={onClose} onLoginSuccess={onLoginSuccess} />
        
        <SignUpPrompt
          onSignUpClick={onSignUpClick}  // ✅ 전달
          // signUpHref={signUpHref}        // (선택)
        />
      </div>

      <div className="w-full">
        <SocialLoginHeader />
        <SocialLoginForm />
      </div>
    </AuthenticationCard>
  );
};

export default LoginOrganism;
