import React from "react";

// Atom: OTP single cell with functionality
// Spec: 49×49px, radius 10, stroke 1px
// Default stroke: #D9D9D9, Selected/Focused stroke: #000000

export type OtpCellProps = {
  /** Current value of this cell */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when focus changes */
  onFocus?: () => void;
  /** Callback for key events */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Callback for paste events */
  onPaste?: (e: React.ClipboardEvent) => void;
  /** Force selected state (for preview). If omitted, focus will control border via :focus-within */
  selected?: boolean;
  /** Optional index for a11y label, e.g., 1~6 */
  index?: number;
  /** Optional tailwind className extension */
  className?: string;
};

const OtpCell = React.forwardRef<HTMLInputElement, OtpCellProps>(
  ({ 
    value = "", 
    onChange, 
    onFocus, 
    onKeyDown, 
    onPaste, 
    selected = false, 
    index, 
    className = "" 
  }, ref) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // 숫자만 허용하고 한 글자만
      if (/^\d*$/.test(inputValue) && inputValue.length <= 1) {
        onChange?.(inputValue);
      }
    };

    return (
      <label
        className={[
          "flex items-center justify-center",
          "w-[49px] h-[49px]",
          "rounded-[10px]",
          "border",
          selected ? "border-black border-2" : "border-[#D9D9D9]",
          // Focus interaction: when inner input focuses, make stroke black and thicker
          "focus-within:border-black focus-within:border-2",
          className,
        ].join(" ")}
      >
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={handleInput}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          aria-label={
            index !== undefined ? `인증번호 ${index}번째 자리` : "인증번호 입력 칸"
          }
          className="w-full h-full text-center bg-transparent outline-none text-black font-medium"
        />
      </label>
    );
  }
);

OtpCell.displayName = "OtpCell";

export default OtpCell;
