'use client';

import React from 'react';
import AuthenticationCard from '../atoms/Card/Authentication';
import AuthenticationLabel from '../atoms/Heading/Authentication';
import LoginForm from '../molecules/LoginForm';
import SignUpPrompt from '../molecules/SignUpPrompt';
import TextDivider from '../atoms/Label/SocialLogin';
import SocialLoginForm from '../molecules/SocialLogin';

interface LoginOrganismProps {
  className?: string;
  onSignUpClick?: () => void;   // ✅ 추가
  // signUpHref?: string;          // (선택) 라우팅 링크 사용 시
}

const LoginOrganism: React.FC<LoginOrganismProps> = ({ 
  className = "",
  onSignUpClick,
  // signUpHref,
}) => {
  return (
    <AuthenticationCard className={className}>
      <div className="flex flex-col items-center">
        <div className="w-full">
          <AuthenticationLabel type="login" />
        </div>
        
        <LoginForm />
        
        <SignUpPrompt
          onSignUpClick={onSignUpClick}  // ✅ 전달
          // signUpHref={signUpHref}        // (선택)
        />

        <TextDivider />

        <SocialLoginForm />
      </div>
    </AuthenticationCard>
  );
};

export default LoginOrganism;
