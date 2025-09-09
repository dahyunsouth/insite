// front-end/src/components/molecules/LabeledStaticField/LabeledStaticField.tsx

import React from "react";
import SignUpLabel from "@/components/atoms/Auth/Label/SignUp";
import SignUpBody from "@/components/atoms/Auth/Text/SignUp";

interface LabeledStaticFieldProps {
  label: string;
  value: string;
}

const LabeledStaticField: React.FC<LabeledStaticFieldProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <SignUpLabel>{label}</SignUpLabel>
      <SignUpBody>{value}</SignUpBody>
    </div>
  );
};

export default LabeledStaticField;
