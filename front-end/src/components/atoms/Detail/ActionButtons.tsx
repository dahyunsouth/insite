"use client";

import React from "react";
import { HeartIcon, ScaleIcon } from "@heroicons/react/24/outline";

type ActionButtonsProps = {
  onCompare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
  isLoading?: boolean;
  className?: string;
};

export default function ActionButtons({ 
  onCompare, 
  onSave, 
  isSaved = false, 
  isComparing = false,
  isLoading = false,
  className = "" 
}: ActionButtonsProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
        <button
        type="button"
        onClick={onSave}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border transition-colors duration-200 font-medium text-sm ${
          isLoading 
            ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" 
            : isSaved 
              ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer" 
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
        }`}
      >
        <HeartIcon className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
        {isLoading ? "처리 중..." : isSaved ? "저장된 상권" : "저장하기"}
      </button>
       <button
         type="button"
         onClick={onCompare}
         disabled={isLoading}
         className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border transition-colors duration-200 font-medium text-sm ${
           isLoading
             ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
             : isComparing 
               ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer" 
               : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
         }`}
       >
         <ScaleIcon className={`h-4 w-4 ${isComparing ? "fill-current text-blue-500" : ""}`} />
         {isComparing ? "비교 중인 상권" : "비교함 담기"}
       </button>
      
      
    </div>
  );
}
