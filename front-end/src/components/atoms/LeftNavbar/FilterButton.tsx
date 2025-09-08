"use client";

import React, { useState } from "react";

type FilterButtonProps = {
  className?: string;
  onChange?: (state: { monthlySales: boolean; storeSize: boolean }) => void;
};

export default function FilterButton({ className, onChange }: FilterButtonProps) {
  const [active, setActive] = useState<"monthlySales" | "storeSize" | null>(null);

  const baseBtn =
    "px-3 py-1.5 rounded-md border text-sm bg-transparent select-none transition-colors duration-150 focus:outline-none cursor-pointer";

  const defaultClasses = " border-gray-300 text-black hover:border-[#1D73F3] hover:text-[#1D73F3]";
  const selectedClasses = " border-[#3288FF] text-[#3288FF] hover:border-[#3288FF] hover:text-[#3288FF]";

  const select = (key: "monthlySales" | "storeSize") => {
    setActive(key);
    if (onChange) {
      onChange({ monthlySales: key === "monthlySales", storeSize: key === "storeSize" });
    }
  };

  return (
    <div className={"flex items-center gap-2 " + (className ?? "") }>
      <button
        type="button"
        aria-pressed={active === "monthlySales"}
        onClick={() => select("monthlySales")}
        className={baseBtn + (active === "monthlySales" ? selectedClasses : defaultClasses)}
      >
        월 매출
      </button>
      <button
        type="button"
        aria-pressed={active === "storeSize"}
        onClick={() => select("storeSize")}
        className={baseBtn + (active === "storeSize" ? selectedClasses : defaultClasses)}
      >
        매장 크기
      </button>
    </div>
  );
}


