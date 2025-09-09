import React from "react";

type PillSurfaceProps = {
  className?: string;
  /**
   * If true, renders an absolutely positioned background layer that
   * fills its positioned parent (useful inside buttons).
   */
  fillParent?: boolean;
  children?: React.ReactNode;
};

/**
 * Detail/PillSurface atom
 * - Visual surface only: translucent black background, rounded to a pill, optional shadow.
 * - No interaction or layout spacing. Can optionally render as a fill layer.
 */
export default function PillSurface({
  className,
  fillParent = false,
  children,
}: PillSurfaceProps) {
  const base =
    "bg-[rgba(0,0,0,0.7)] rounded-[100px] overflow-hidden " +
    (className ?? "");

  if (fillParent) {
    return (
      <span
        aria-hidden
        className={"absolute inset-0 pointer-events-none z-0 " + base}
      />
    );
  }

  return <div className={base}>{children}</div>;
}
