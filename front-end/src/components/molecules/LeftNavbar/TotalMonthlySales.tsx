"use client";

import React from "react";
import MonthlySalesHeader from "@/components/atoms/LeftNavbar/MonthlySales/MonthlySalesHeader";
import MonthlySalesBody from "@/components/atoms/LeftNavbar/MonthlySales/MonthlySalesBody";

type TotalMonthlySalesProps = {
  onClose?: () => void;
  onHelpClick?: () => void;
};

const TotalMonthlySales = ({ onClose, onHelpClick }: TotalMonthlySalesProps) => {
  return (
    <div className="w-full bg-white py-4 pr-4 pl-5 space-y-2">
      <MonthlySalesHeader onClose={onClose} onHelpClick={onHelpClick} />
      <MonthlySalesBody />
    </div>
  );
};

export default TotalMonthlySales;
