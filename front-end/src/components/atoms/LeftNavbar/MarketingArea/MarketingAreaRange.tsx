import React from "react";
import { COLORS, VIZ_COLORS } from '@/config/colors';

type LegendItem = {
  color: string;
  label: string;
};

const ITEMS: LegendItem[] = [
  { color: COLORS.TEXT_PRIMARY, label: "5개 미만" },
  { color: VIZ_COLORS[0], label: "5 ~ 10개" },
  { color: VIZ_COLORS[1], label: "11 ~ 50개" },
  { color: VIZ_COLORS[2], label: "51 ~ 300개" },
  { color: VIZ_COLORS[3], label: "301 ~ 1,000개" },
  { color: VIZ_COLORS[4], label: "1,001 ~ 2,000개" },
  { color: VIZ_COLORS[5], label: "2,000개 초과" },
];

export default function MarketingAreaRange() {
  return (
    <div className="w-full">
      <div className="text-sm text-gray-400 mb-2">주요 상가 규모</div>
      <div className="flex flex-col gap-2">
        {ITEMS.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block align-middle rounded-sm"
              style={{
                backgroundColor: it.color,
                width: "1em",
                height: "1em",
              }}
            />
            <span className="text-black font-normal text-sm">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}