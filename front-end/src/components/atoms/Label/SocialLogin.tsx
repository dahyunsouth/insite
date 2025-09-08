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
        gap-4
        my-4
        ${className}
      `}
      {...props}
    >
      <div className="flex-1 border-t border-[#D9D9D9]"></div>
      <span className="text-[16px] font-normal text-[#8C8C8C] whitespace-nowrap">
        {text}
      </span>
      <div className="flex-1 border-t border-[#D9D9D9]"></div>
    </div>
  );
};

export default TextDivider;