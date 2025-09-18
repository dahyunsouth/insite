import React from "react";

type LabelTextProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Detail/LabelText atom
 * - Typography only: Inter Regular 25px, line-height 40px, color #FFFFFF.
 * - Single-line with ellipsis.
 */
export default function LabelText({ className, children }: LabelTextProps) {
  return (
    <span
      className={
        "text-white text-[17.5px] leading-[40px] font-normal " +
        "whitespace-nowrap cursor-pointer " +
        (className ?? "")
      }
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </span>
  );
}
