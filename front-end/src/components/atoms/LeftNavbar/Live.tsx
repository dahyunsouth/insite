import Image from "next/image";
import React from "react";

type LiveProps = {
  className?: string;
};

export default function Live({ className }: LiveProps) {
  return (
    <div
      className={
        "rounded-md p-[1px] " +
        "w-[clamp(110px,14vw,160px)] h-[clamp(27px,3.7vw,37px)] " +
        (className ?? "")
      }
      style={{
        background: "linear-gradient(90deg, #EE69FF, #6AABFF)",
      }}
    >
      <div
        className={
          "flex items-center justify-center gap-2 rounded-[inherit] " +
          "w-full h-full px-[clamp(10px,1.8vw,14px)] " +
          "text-[clamp(12px,1.15vw,14px)] bg-[transparent]"
        }
        style={{ backgroundColor: "var(--background)" }}
      >
        <Image
          src="/images/ChartArrowRise.png"
          alt="상승 화살표"
          width={24}
          height={24}
          className="shrink-0 w-[1.25em] h-[1.25em]"
          priority
        />
        <span className="text-black font-normal leading-none whitespace-nowrap">실시간</span>
      </div>
    </div>
  );
}


