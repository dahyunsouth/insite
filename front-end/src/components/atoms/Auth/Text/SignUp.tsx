// front-end/src/components/atoms/Text/SignUp.tsx

import React from "react";

interface BodyProps {
  children: React.ReactNode;
}

const SignUpBody: React.FC<BodyProps> = ({ children }) => {
  return (
    <p
      className="
        font-normal
        text-medium
        leading-[20px]
        text-black
      "
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </p>
  );
};

export default SignUpBody;
