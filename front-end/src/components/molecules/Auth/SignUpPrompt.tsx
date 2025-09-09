'use client';

import React from 'react';
import SignUpPromptText from '../../atoms/Auth/Text/SignUpPromptText';
import SignUpLink from '../../atoms/Auth/Button/SignUp';

interface SignUpPromptProps {
  className?: string;
  promptText?: string;
  linkText?: string;
  onSignUpClick?: () => void;
  signUpHref?: string;
}

const SignUpPrompt: React.FC<SignUpPromptProps> = ({
  className = '',
  promptText = '아직 회원이 아니신가요?',
  linkText = '회원가입',
  onSignUpClick,
  signUpHref,
  ...props
}) => {
  return (
    <div
      className={`
        flex
        items-center
        justify-center
        mt-3
        gap-1
        ${className}
      `}
      {...props}
    >
      <SignUpPromptText>
        {promptText}
      </SignUpPromptText>
      <SignUpLink
        onClick={onSignUpClick}
        href={signUpHref}
      >
        {linkText}
      </SignUpLink>
    </div>
  );
};

export default SignUpPrompt;