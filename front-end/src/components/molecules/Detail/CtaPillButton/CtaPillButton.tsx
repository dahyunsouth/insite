"use client";

import React from "react";
import SearchIcon from "@/components/atoms/Detail/SearchIcon/SearchIcon";
import LabelText from "@/components/atoms/Detail/LabelText/LabelText";
import PillSurface from "@/components/atoms/Detail/PillSurface/PillSurface";

type CtaPillButtonProps = {
  label: string;
  className?: string;
  onPress?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  /** Optional icon override. Defaults to green search icon */
  icon?: React.ReactNode;
  /** If true, sets width: 100% */
  fullWidth?: boolean;
  /** Optional explicit max width in px (overrides default 445) */
  maxWidth?: number;
};

/**
 * Molecule: CtaPillButton
 * - Composition: PillSurface (fill background) + SearchIcon + LabelText
 * - Layout based on Figma spec (H=80, gap=10, padding Y=20 X=50, radius=100)
 */
export default function CtaPillButton({
  label,
  className,
  onPress,
  ariaLabel,
  disabled,
  icon,
  fullWidth,
  maxWidth,
}: CtaPillButtonProps) {
  const widthClasses = fullWidth
    ? "w-full"
    : "w-auto min-w-[200px] max-w-[90vw]";

  const maxWidthStyle = maxWidth ? { maxWidth: `${Math.max(0, maxWidth)}px` } : undefined;

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      onClick={onPress}
      disabled={disabled}
      className={
        "group relative isolate inline-flex items-center justify-center " +
        "h-[50px] px-[30px] py-[20px] " +
        `${widthClasses} ` +
        "rounded-[100px] text-white select-none " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 " +
        "disabled:opacity-50 disabled:cursor-not-allowed " +
        (className ?? "")
      }
      style={maxWidthStyle}
    >
      {/* Visual background surface */}
      <PillSurface
        fillParent
        className={
          "transition-colors duration-150 " +
          "group-hover:bg-[rgba(0,0,0,0.65)] group-active:bg-[rgba(0,0,0,0.75)]"
        }
      />

      {/* Foreground content */}
      <span className="relative z-10 inline-flex items-center gap-[10px]">
        {icon ?? <SearchIcon size={20} />}
        <LabelText>{label}</LabelText>
      </span>
    </button>
  );
}
