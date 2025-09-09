// 상하좌우 padding: 10px

import React from 'react';

const Bar1 = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`
        w-[376px] h-[50px]
        p-[10px]
        border-b border-[#E9ECEF]
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