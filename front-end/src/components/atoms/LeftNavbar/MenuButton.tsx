"use client";

import React, { useState } from "react";

type MenuKey = "market" | "sales" | "footTraffic" | "transit";

type MenuButtonProps = {
  className?: string;
  onChange?: (active: MenuKey | null) => void;
};

export default function MenuButton({ className, onChange }: MenuButtonProps) {
  const [active, setActive] = useState<MenuKey | null>(null);

  const baseBtn =
    "px-3 py-1.5 rounded-md text-sm select-none whitespace-nowrap transition-colors duration-150 focus:outline-none cursor-pointer";

  const defaultClasses = " w-1/4 bg-[#3288FF]/10 text-[#3288FF] hover:bg-[#3288FF]/20 hover:text-[#3288FF]";

  const select = (key: MenuKey) => {
    setActive(key);
    if (onChange) onChange(key);
  };

  return (
    <div className={"flex items-center gap-2 " + (className ?? "") }>
      <button
        type="button"
        aria-pressed={active === "market"}
        onClick={() => select("market")}
        className={baseBtn + defaultClasses}
      >
        상권
      </button>
      <button
        type="button"
        aria-pressed={active === "sales"}
        onClick={() => select("sales")}
        className={baseBtn + defaultClasses}
      >
        월매출
      </button>
      {/* <button
        type="button"
        aria-pressed={active === "footTraffic"}
        onClick={() => select("footTraffic")}
        className={baseBtn + defaultClasses}
      >
        유동인구
      </button>
      <button
        type="button"
        aria-pressed={active === "transit"}
        onClick={() => select("transit")}
        className={baseBtn + defaultClasses}
      >
        대중교통
      </button> */}
    </div>
  );
}