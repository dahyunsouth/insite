'use client';

import React from 'react';

const SubmitButton = ({
 children,
 onClick = () => {},
 className = "",
 ...props
}: {
 children?: React.ReactNode;
 onClick?: () => void;
 className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) => {
 return (
   <button
     onClick={onClick}
     className={`
       w-full h-[60px]
       px-[20px] py-0
       rounded-[15px]
       bg-dark
       text-white text-medium font-normal
       ${className}
     `}
     {...props}
   >
     {children}
   </button>
 );
};

export default SubmitButton;