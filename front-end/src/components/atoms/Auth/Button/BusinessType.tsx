import React from 'react';

const BusinessTypeButton = ({ 
  children = '카페',
  isSelected = false,
  onClick = () => {},
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        w-[60px] h-[39px] 
        px-[15px] py-[10px]
        rounded-[5px]
        border-[0.5px] border-[#3288FF]
        bg-transparent
        text-[#3288FF] text-sm font-medium
        transition-all duration-200
        hover:bg-[#3288FF] hover:text-white
        focus:outline-none focus:ring-2 focus:ring-[#3288FF] focus:ring-opacity-50
        ${isSelected ? 'bg-[#3288FF] text-white' : ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default BusinessTypeButton;