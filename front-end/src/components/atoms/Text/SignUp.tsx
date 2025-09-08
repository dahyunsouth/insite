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
        text-[20px]
        leading-[60px]
        text-black
      "
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </p>
  );
};

export default SignUpBody;
