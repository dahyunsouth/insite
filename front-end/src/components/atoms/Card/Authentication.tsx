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
      style={{
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AuthenticationCard;