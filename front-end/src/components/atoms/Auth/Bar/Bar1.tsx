// 상하좌우 padding: 10px

import React from 'react';

const Bar1 = ({
  children,
  className = '',
  ...props
}: { children?: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`
        w-full max-w-[376px] h-[50px]
        p-[10px]
        border-b border-line-light
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

export default Bar1;