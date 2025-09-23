import React from 'react';

interface OpenButtonProps {
  onClick?: () => void;
  className?: string;
}

const OpenButton: React.FC<OpenButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-white 
        border border-blue-200 
        rounded-r-2xl 
        rounded-l-none
        w-6 h-18 
        flex items-center justify-center
        shadow-sm
        hover:shadow-md
        transition-shadow duration-200
        hover:bg-blue-50
        active:bg-blue-100
        cursor-pointer
        ${className}
      `}
      aria-label="열기"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-600"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default OpenButton;
