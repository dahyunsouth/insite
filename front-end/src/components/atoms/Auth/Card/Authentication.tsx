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
        w-[400px] max-w-[90vw] h-[90vh] min-h-[500px]
        px-[40px] py-[40px]
        rounded-[20px]
        bg-[#FFFFFF]
        overflow-y-auto
        flex flex-col items-center justify-between
        [&::-webkit-scrollbar]:hidden
        ${className}
      `}
      style={{
        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AuthenticationCard;