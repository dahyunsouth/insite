// padding: 20, 10px
// 배경색: 토파

import React from 'react';

const Bar3 = ({
  children,
  className = '',
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`
        w-full max-w-[376px] h-[50px]
        px-[12px] py-[20px]
        border-b border-[#E9ECEF]
        bg-brand-primary
        ${className}
      `}
      style={{
        borderBottomWidth: '1px'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Bar3;