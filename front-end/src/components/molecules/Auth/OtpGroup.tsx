import React from "react";
import OtpCell from "@/components/atoms/Auth/InputBox/OtpCell";

// Molecule: OtpGroup
// Spec: multiple OtpCell arranged in a row, 5px gap between each
// UI only (no value handling, no verification logic)

export type OtpGroupProps = {
  length?: number; // default 6 cells
  className?: string;
};

const OtpGroup: React.FC<OtpGroupProps> = ({ length = 6, className = "" }) => {
  return (
    <div className={`flex gap-[5px] ${className}`}>
      {Array.from({ length }).map((_, idx) => (
        <OtpCell key={idx} index={idx + 1} />
      ))}
    </div>
  );
};

export default OtpGroup;
