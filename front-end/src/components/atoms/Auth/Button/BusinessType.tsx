import React from 'react';

const BusinessTypeButton = ({
  children = '카페',
  isSelected = false,
  onClick = () => {},
  ...props
}: {
  children?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        w-[60px] h-[39px] 
        px-[15px] py-[10px]
        rounded-[5px]
        border-[0.5px] border-brand-primary
        bg-transparent
        text-brand-primary text-sm font-medium
        transition-all duration-200
        hover:bg-brand-primary hover:text-white
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50
        ${isSelected ? 'bg-brand-primary text-white' : ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default BusinessTypeButton;