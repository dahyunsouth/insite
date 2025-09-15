'use client';

import React, { useState } from 'react';

interface CheckBoxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const CheckBox: React.FC<CheckBoxProps> = ({ 
  checked: controlledChecked, 
  onChange, 
  className = '' 
}) => {
  const [internalChecked, setInternalChecked] = useState(false);
  
  // controlled 또는 uncontrolled 모드 지원
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  
  const handleClick = () => {
    const newChecked = !isChecked;
    
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-6 h-6 rounded-lg border transition-all duration-200 ease-in-out
        flex items-center justify-center cursor-pointer
        ${isChecked 
          ? 'border-[#3288FF] bg-[#3288FF]' 
          : 'border-gray-300 bg-white hover:bg-gray-100 hover:border-gray-400'
        }
        ${className}
      `}
      aria-checked={isChecked}
      role="checkbox"
    >
      <svg
        width="12"
        height="9"
        viewBox="0 0 12 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-opacity duration-200"
      >
        <path
          d="M1 4.5L4.5 8L11 1"
          stroke={isChecked ? '#ffffff' : '#d1d5db'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default CheckBox;
