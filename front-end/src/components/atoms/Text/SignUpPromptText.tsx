import React from 'react';

interface SignUpPromptTextProps {
  className?: string;
  children?: React.ReactNode;
}

const SignUpPromptText: React.FC<SignUpPromptTextProps> = ({
  className = '',
  children = '아직 회원이 아니신가요?',
  ...props
}) => {
  return (
    <span
      className={`
        text-[14px]
        font-normal
        text-[#000000]
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default SignUpPromptText;