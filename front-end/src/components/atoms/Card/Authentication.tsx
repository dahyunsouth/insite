// 로그인, 회원가입

import React from 'react';

const AuthenticationCard = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`
        w-[400px] h-[821px]
        px-[40px] py-[50px]
        rounded-[30px]
        bg-[#FFFFFF]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default AuthenticationCard;