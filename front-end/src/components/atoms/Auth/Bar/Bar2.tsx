// padding: 10, 5, 0, 5px

import React from 'react';

const Bar2 = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`
        w-[376px] h-[50px]
        pt-[10px] pr-[5px] pb-0 pl-[5px]
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

export default Bar2;