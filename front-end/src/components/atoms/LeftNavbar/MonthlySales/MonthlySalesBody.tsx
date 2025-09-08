"use client";

import React from "react";

type MonthlySalesBodyProps = {
  className?: string;
};

export default function MonthlySalesBody({ className }: MonthlySalesBodyProps) {
  return (
    <div className={`w-full ${className ?? ""}`}>
      <div className="text-sm text-gray-500 font-medium mb-2">
        지역을 선택하면 상세 정보가 표시됩니다.
      </div>
      <div className="text-sm text-gray-400">
        각 카드사의 업종별 월별 매출의 평균을 계산한 자료이며,
        현금 등의 기타 매출자료는 합산되지 않았습니다.
      </div>
    </div>
  );
}
