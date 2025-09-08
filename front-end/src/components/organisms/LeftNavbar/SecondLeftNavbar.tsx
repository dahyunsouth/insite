"use client";

import React, { useState } from "react";

const TABS = ["이야기", "상권비교", "뉴스", "마이페이지"] as const;
type Tab = typeof TABS[number];

const SecondLeftNavbar = () => {
  const [active, setActive] = useState<Tab | null>(null);

  const baseBtn =
    "px-2 py-2 text-sm sm:text-base leading-none cursor-pointer select-none transition-all duration-150";

  return (
    <div className="w-full bg-[#3288FF] text-white">
      <nav className="w-full px-3 py-2">
        <div className="w-full flex items-center justify-between">
          {TABS.map((label) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive((prev) => (prev === label ? null : label))}
                className={
                  baseBtn +
                  (isActive
                    ? " font-semibold"
                    : " font-normal hover:font-semibold")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SecondLeftNavbar;


