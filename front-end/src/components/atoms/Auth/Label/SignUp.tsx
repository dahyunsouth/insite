// front-end/src/components/atoms/Label/SignUp.tsx

import React from "react";

interface LabelProps {
  children: React.ReactNode;
}

const SignUpLabel: React.FC<LabelProps> = ({ children }) => {
  return (
    <label
      className="
        font-semibold
        text-medium
        leading-[60px]
        text-[#371E1E]
      "
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </label>
  );
};

export default SignUpLabel;
