import React from "react";

// Atom: OTP single cell (UI only)
// Spec: 49×49px, radius 10, stroke 1px
// Default stroke: #D9D9D9, Selected/Focused stroke: #000000
// Logic (value/verification) intentionally omitted.

export type OtpCellProps = {
  /** Force selected state (for preview). If omitted, focus will control border via :focus-within */
  selected?: boolean;
  /** Optional index for a11y label, e.g., 1~6 */
  index?: number;
  /** Optional tailwind className extension */
  className?: string;
};

const OtpCell = React.forwardRef<HTMLInputElement, OtpCellProps>(
  ({ selected = false, index, className = "" }, ref) => {
    return (
      <label
        className={[
          "flex items-center justify-center",
          "w-[49px] h-[49px]",
          "rounded-[10px]",
          "border",
          selected ? "border-black" : "border-[#D9D9D9]",
          // Focus interaction (UI only): when inner input focuses, make stroke black
          "focus-within:border-black",
          className,
        ].join(" ")}
      >
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          aria-label={
            index !== undefined ? `인증번호 ${index}번째 자리` : "인증번호 입력 칸"
          }
          // Pure shell UI: transparent, centered character, no outline
          className="w-full h-full text-center bg-transparent outline-none caret-transparent"
        />
      </label>
    );
  }
);

OtpCell.displayName = "OtpCell";

export default OtpCell;
