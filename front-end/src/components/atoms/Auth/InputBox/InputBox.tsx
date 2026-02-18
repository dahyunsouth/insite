'use client';

import React from 'react';

interface InputBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  [key: string]: unknown;
}

const AuthenticationInputBox: React.FC<InputBoxProps> = ({ 
  placeholder = "",
  value = "",
  onChange = () => {},
  type = "text",
  className = "",
  ...props 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full h-[60px]
        px-[20px] py-0
        rounded-[15px]
        border border-line-default
        outline-none
        focus:border-[2px] focus:border-dark
        text-black text-medium font-normal
        placeholder:text-[#BCBCBC]
        ${className}
      `}
      {...props}
    />
  );
};

export default AuthenticationInputBox;