"use client";

import React from "react";

type PopulationType = "유동" | "직장" | "상주";

type PopulationToggleProps = {
  selected: PopulationType;
  onChange: (type: PopulationType) => void;
  className?: string;
};

export default function PopulationToggle({ selected, onChange, className }: PopulationToggleProps) {
  const options: PopulationType[] = ["유동", "직장", "상주"];

  return (
    <div className={`inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 ${className ?? ""}`}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={
              "cursor-pointer px-3 py-1 text-sm font-medium transition-all duration-150 " +
              "rounded-full " +
              (isSelected
                ? "bg-white text-[#3288FF] shadow-sm"
                : "text-gray-600 hover:text-gray-800")
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
