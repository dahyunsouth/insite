import Image from "next/image";
import React from "react";

type SearchIconProps = {
  className?: string;
  /** Pixel size for width/height. Default 30. */
  size?: number;
  /** Accessible label; omit for decorative usage. */
  ariaLabel?: string;
};

/**
 * Detail/SearchIcon atom
 * - Renders the green search icon SVG from public assets.
 * - Visual-only: no interaction, no layout constraints beyond size.
 */
export default function SearchIcon({
  className,
  size = 30,
  ariaLabel,
}: SearchIconProps) {
  const dimension = Math.max(0, Math.floor(size));
  return (
    <Image
      src="/images/GreenSearchIcon.svg"
      alt={ariaLabel ?? ""}
      aria-hidden={ariaLabel ? undefined : true}
      width={dimension}
      height={dimension}
      className={className}
      priority={false}
    />
  );
}
