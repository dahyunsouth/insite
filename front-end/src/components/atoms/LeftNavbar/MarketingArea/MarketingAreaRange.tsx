import React from "react";

type LegendItem = {
  color: string;
  label: string;
};

const ITEMS: LegendItem[] = [
  { color: "#000000", label: "5개 미만" },
  { color: "#9DDE4D", label: "5 ~ 10개" },
  { color: "#FFD62B", label: "11 ~ 50개" },
  { color: "#FF8A36", label: "51 ~ 300개" },
  { color: "#FF3F43", label: "301 ~ 1,000개" },
  { color: "#5473DF", label: "1,001 ~ 2,000개" },
  { color: "#8C2ED4", label: "2,000개 초과" },
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