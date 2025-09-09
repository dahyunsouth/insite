import React from 'react';

interface TextDividerProps {
  text?: string;
  className?: string;
}

const TextDivider: React.FC<TextDividerProps> = ({
  text = '소셜 로그인',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        flex
        items-center
        w-full
        my-4
        ${className}
      `}
      {...props}
    >
      <div className="flex-1 h-[1px] bg-gray-300"></div>
      <span className="px-4 text-[16px] font-normal text-[#8C8C8C] whitespace-nowrap">
        {text}
      </span>
      <div className="flex-1 h-[1px] bg-gray-300"></div>
    </div>
  );
};

export default TextDivider;