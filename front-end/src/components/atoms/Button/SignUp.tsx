'use client';
import React from 'react';

interface SignUpProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string; // 실제 라우팅이 필요할 때만 전달
}

const SignUp: React.FC<SignUpProps> = ({
  className = '',
  children = '회원가입',
  onClick,
  href,
  ...props
}) => {
  // 라우팅이 필요 없으면 버튼으로 렌더
  if (!href) {
    return (
      <button
        type="button"
        // onClick={onClick}
        onClick={() => { console.log('signup click'); onClick?.(); }}
        className={`text-[14px] font-normal text-[#3288FF] cursor-pointer hover:underline ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  // 실제 라우팅이 필요할 때만 링크 사용
  return (
    <a
      href={href}
      onClick={onClick}
      className={`text-[14px] font-normal text-[#3288FF] cursor-pointer hover:underline ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export default SignUp;
